import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildTitle } from '../../constants/appMeta.js';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';
import '../PageLayout.css';
import '../../styles/PlaylistDetailPage.css';


/**
 * Playlist Page
 * @returns {JSX.Element}
 */
export default function PlaylistPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { token } = useRequireToken();

  // Met le titre de la page
  useEffect(() => {
    const titleSuffix = playlist?.name ? `Playlist – ${playlist.name}` : 'Playlist';
    document.title = buildTitle(titleSuffix);
  }, [playlist]);

  // Charge la playlist depuis l'API
    useEffect(() => {
    if (!token || !id) return;

    fetchPlaylistById(token, id)
      .then((res) => {
        if (res.error) {
          if (!handleTokenError(res.error, navigate)) {
            setError(res.error.message || res.error);
          }
          setPlaylist(null);
          return;
        }

        setPlaylist(res.data);
      })
      .catch((err) => {
        setError(err.message);
        setPlaylist(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, id, navigate]);


  if (loading) {
    return (
      <section className="playlist-container page-container">
        <output
          className="playlist-loading"
          data-testid="loading-indicator"
        >
          Loading playlist…
        </output>
      </section>
    );
  }

  if (error) {
    const message = typeof error === 'string' ? error : error?.message || 'Unable to load playlist.';

    return (
      <section className="playlist-container page-container">
        <div className="playlist-error" role="alert">
          {message}
        </div>
      </section>
    );
  }

  if (!playlist) {
    return (
      <section className="playlist-container page-container">
        <div className="playlist-error" role="alert">
          Playlist not found.
        </div>
      </section>
    );
  }

  const tracks = playlist.tracks?.items ?? [];

  return (
    <section
      className="playlist-container page-container"
      aria-labelledby="playlist-title"
    >
      <header className="playlist-header">
        <div className="playlist-header-image">
          {playlist.images?.[0] && (
            <img
              src={playlist.images[0].url}
              alt={`Cover of ${playlist.name}`}
              className="playlist-cover"
            />
          )}
        </div>

        <div className="playlist-header-text-with-link">
          <div className="playlist-header-text">
                        <h1 id="playlist-title" className="playlist-title page-title">
              {playlist.name}
            </h1>
            {playlist.description && (
              <h2 className="playlist-subtitle page-subtitle">
                {playlist.description}
              </h2>
            )}
            <p className="playlist-track-count">
              {(playlist.tracks?.total ?? tracks.length) || 0} tracks
            </p>
            </div>


          {playlist.external_urls?.spotify && (
            <a
              href={playlist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="playlist-spotify-link"
            >
              Open in Spotify
            </a>
          )}
        </div>
      </header>

      {tracks.length === 0 ? (
        <p className="playlist-empty">This playlist is empty.</p>
      ) : (
        <ol className="playlist-list">
          {tracks.map((item) =>
            item?.track ? (
              <TrackItem key={item.track.id} track={item.track} />
            ) : null
          )}
        </ol>
      )}
    </section>
  );
}
