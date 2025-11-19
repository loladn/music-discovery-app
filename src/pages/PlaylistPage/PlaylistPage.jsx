import { useParams } from 'react-router-dom';

/**
 * Playlist Page
 * @returns {JSX.Element}
 */
export default function PlaylistPage() {
    // récupérer l'id depuis l'url sur lequel on se trouve
    const { id } = useParams();

    return (
        <div>
            <h1>Playlist Page</h1>
            <p>Playlist ID: {id}</p>    
        </div>
    );
}