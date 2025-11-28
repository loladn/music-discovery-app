import { useEffect, useState } from 'react';
import { buildTitle } from '../../constants/appMeta.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import { fetchUserTopArtists, fetchUserTopTracks } from '../../api/spotify-me.js';
import { handleTokenError } from '../../utils/handleTokenError.js';
import SimpleCard from '../../components/SimpleCard/SimpleCard.jsx';
import { useNavigate, Navigate } from 'react-router-dom';
import './DashboardPage.css';
import '../PageLayout.css';

/**
 * Dashboard Page - Display user's top artist and top track
 * @returns {JSX.Element}
 */
export default function DashboardPage() {
  // require token to fetch data
  const { token } = useRequireToken();
  const navigate = useNavigate();

  // State for top artist and top track
  const [topArtist, setTopArtist] = useState(null);
  const [topTrack, setTopTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  // Set document title
  useEffect(() => {
    document.title = buildTitle('Dashboard');
  }, []);

  // Fetch top artist and top track
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch top artist (limit = 1)
        const artistsResponse = await fetchUserTopArtists(token, 1, 'short_term');
        
        if (artistsResponse.error) {
          const message = typeof artistsResponse.error === 'string' ? artistsResponse.error : artistsResponse.error?.message;
          
          if (message && message.toLowerCase().includes('access token expired')) {
            setRedirectToLogin(true);
            return;
          }
          
          if (!handleTokenError(artistsResponse.error, navigate)) {
            setError(message || artistsResponse.error);
          }
        } else if (artistsResponse.data?.items?.length > 0) {
          setTopArtist(artistsResponse.data.items[0]);
        }

        // Fetch top track (limit = 1)
        const tracksResponse = await fetchUserTopTracks(token, 1, 'short_term');
        
        if (tracksResponse.error) {
          const message = typeof tracksResponse.error === 'string' ? tracksResponse.error : tracksResponse.error?.message;
          
          if (message && message.toLowerCase().includes('access token expired')) {
            setRedirectToLogin(true);
            return;
          }
          
          if (!handleTokenError(tracksResponse.error, navigate)) {
            setError(message || tracksResponse.error);
          }
        } else if (tracksResponse.data?.items?.length > 0) {
          setTopTrack(tracksResponse.data.items[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (redirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <section className="dashboard-container page-container" aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className="dashboard-title page-title">Dashboard</h1>
      
      {loading && <div className="dashboard-loading">Loading dashboard...</div>}
      {error && <div className="dashboard-error" role="alert">{error}</div>}
      
      {!loading && !error && (
        <div className="dashboard-content">
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Top Artist</h2>
            {topArtist && (
              <SimpleCard
                imageUrl={topArtist.images?.[0]?.url}
                title={topArtist.name}
                subtitle={topArtist.genres?.join(', ')}
                link={topArtist.external_urls?.spotify}
              />
            )}
          </div>

          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Top Track</h2>
            {topTrack && (
              <SimpleCard
                imageUrl={topTrack.album?.images?.[0]?.url}
                title={topTrack.name}
                subtitle={topTrack.artists?.map(a => a.name).join(', ')}
                link={topTrack.external_urls?.spotify}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
