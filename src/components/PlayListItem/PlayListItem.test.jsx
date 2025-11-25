// src/components/PlayListItem.test.jsx

import { describe, expect, test } from '@jest/globals'
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlayListItem from './PlayListItem';

describe('PlayListItem component', () => {
    test('renders playlist information correctly', () => {
        // Arrange
        const playlist = {
            id: 'playlist1',
            name: 'Test Playlist',
            images: [{ url: 'test.jpg' }],
            owner: { display_name: 'Test Owner' },
            tracks: { total: 15 },
            external_urls: { spotify: 'https://open.spotify.com/playlist/playlist1' }
        };
        // Act
        render(
            <BrowserRouter>
                <PlayListItem playlist={playlist} />
            </BrowserRouter>
        );

        // Assert
        // items are rendered correctly
        expect(screen.getByTestId(`playlist-item-${playlist.id}`)).toBeInTheDocument();
        // image is rendered correctly
        expect(screen.getByAltText('cover')).toHaveAttribute('src', playlist.images[0].url);
        // text content is rendered correctly
        expect(screen.getByText(playlist.name)).toBeInTheDocument();
        // owner name is rendered correctly
        expect(screen.getByText(`By ${playlist.owner.display_name}`)).toBeInTheDocument();
        // track count is rendered correctly
        expect(screen.getByText(`${playlist.tracks.total} tracks`)).toBeInTheDocument();
        
        // Vérifie le lien interne vers la page de détail
        const internalLink = screen.getByRole('link', { name: /Test Playlist/ });
        expect(internalLink).toHaveAttribute('href', `/playlist/${playlist.id}`);
        
        // Vérifie le lien externe vers Spotify
        const spotifyLink = screen.getByRole('link', { name: /Open/ });
        expect(spotifyLink).toHaveAttribute('href', playlist.external_urls.spotify);
        expect(spotifyLink).toHaveAttribute('target', '_blank');
    });
});
