import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';
import TrackItem from '../../components/TrackItem/TrackItem.jsx';


/**
 * Playlist Page
 * @returns {JSX.Element}
 */
export default function PlaylistPage() {
    // récupérer l'id depuis l'url sur lequel on se trouve
    const { id } = useParams();

    // états pour les données
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // récupérer le token
    const {token} = useRequireToken();

    // effet pour charger les données
    useEffect(() => {
        // on attend la vérification de l'authentification
        if (!token || !id) return;

        console.log('Chargement de la playlist avec ID :', id);

        fetchPlaylistById(token, id)
            .then(result => {
                console.log('Résultat de l\'API :', result);
                if (result.error) {
                    setError(result.error);
                } else {
                    setPlaylist(result.data);
                }
                
            })
            .catch(err => {
                console.error('Erreur lors de la récupération de la playlist :', err);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token, id]);

    //affichage basique pour l'instant
    if (loading) return <div>Chargement de la playlist...</div>;
    if (error) return <div>Erreur : {error}</div>;
    if (!playlist) return <div>Playlist non trouvée</div>;

    return (
        <div>
            <h1>Playlist Page</h1>
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
                {playlist.images?.[0] && (
                    <img 
                        src={playlist.images[0].url} 
                        alt={`Cover of ${playlist.name}`}
                        style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                )}

                <div>
                    <h2>{playlist.name}</h2>
                    <p>{playlist.description}</p>
                    <p>{playlist.owner?.display_name}</p>
                    <p><strong>{playlist.tracks?.items?.length || 0} tracks</strong></p>

                    <a href={playlist.external_urls?.spotify} target="_blank" rel="noopener noreferrer" style={{padding: '10px 15px', backgroundColor: '#1DB954', color: 'white', borderRadius: '4px', textDecoration: 'none'}}>
                        Open in Spotify
                    </a>
                </div>
            </div>
            

            {playlist.tracks?.items && playlist.tracks.items.length > 0 && (
                <div>
                    {/* <h3>Tracks in the playlist</h3> */}
                    <ul style={{listStyle: 'none', padding: 0}}>
                        {playlist.tracks.items.map((item, index) => (
                            <TrackItem key={item.track.id || index} track={item.track} />
                        ))}
                    </ul>
                </div>
            )}
            
            <p><em>ID : {id}</em></p>
        </div>
    );
}