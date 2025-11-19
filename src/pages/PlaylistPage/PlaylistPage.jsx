import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPlaylistById } from '../../api/spotify-playlists.js';
import { useRequireToken } from '../../hooks/useRequireToken.js';


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
            <p>Playlist ID: {id}</p>  
            <h2>{playlist.name}</h2>  
            <p>Description : {playlist.description}</p>
            <p>Nombre de pistes : {playlist.tracks?.items?.length || 0}</p>
        </div>
    );
}