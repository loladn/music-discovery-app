// src/pages/PlaylistsPage.test.jsx

import { describe, expect, test } from '@jest/globals';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PlaylistsPage, { limit } from './PlaylistsPage.jsx';
import * as spotifyApi from '../../api/spotify-me.js';
import { beforeEach, afterEach, jest } from '@jest/globals';
import { KEY_ACCESS_TOKEN } from '../../constants/storageKeys.js';
import { buildTitle } from '../../constants/appMeta.js';

// Mock playlists data
const playlistsData = {
    items: [
        { id: 'playlist1', name: 'My Playlist 1', images: [{ url: 'https://via.placeholder.com/56' }], owner: { display_name: 'User1' }, tracks: { total: 5 }, external_urls: { spotify: 'https://open.spotify.com/playlist/playlist1' } },
        { id: 'playlist2', name: 'My Playlist 2', images: [{ url: 'https://via.placeholder.com/56' }], owner: { display_name: 'User2' }, tracks: { total: 10 }, external_urls: { spotify: 'https://open.spotify.com/playlist/playlist2' } },
    ],
    total: 2
};

// Mock token value
const tokenValue = 'test-token';

// Tests for PlaylistsPage
describe('PlaylistsPage', () => {
    // Setup mocks before each test
    beforeEach(() => {
        // Mock localStorage token access
        jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => key === KEY_ACCESS_TOKEN ? tokenValue : null);

        // Default mock: successful playlists fetch
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockResolvedValue({ data: playlistsData, error: null });
    });

    // Restore mocks after each test
    afterEach(() => {
        jest.restoreAllMocks();
    });

    // Helper to render PlaylistsPage
    const renderPlaylistsPage = () => {
        return render(
            // render PlaylistsPage within MemoryRouter
            <MemoryRouter initialEntries={['/playlists']}>
                <Routes>
                    <Route path="/playlists" element={<PlaylistsPage />} />
                    {/* Dummy login route for redirection when token is expired */}
                    <Route path="/login" element={<div>Login Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    // Helper to wait for loading to finish
    const waitForLoadingToFinish = async () => {
        // initial loading state expectations
        expect(screen.getByRole('status')).toHaveTextContent(/loading playlists/i);
        await waitFor(() => {
            expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
        });
    };

    test('renders playlists page', async () => {
        // Render the PlaylistsPage
        renderPlaylistsPage();

        // Check document title
        expect(document.title).toBe(buildTitle('Playlists'));

        // wait for loading to finish
        await waitForLoadingToFinish();

        // when loading is done, verify playlists content rendered and api called correctly

        // should call fetchUserPlaylists with the token
        expect(spotifyApi.fetchUserPlaylists).toHaveBeenCalledTimes(1);
        expect(spotifyApi.fetchUserPlaylists).toHaveBeenCalledWith(tokenValue, limit);

        // should render a heading of level 1 with text 'Your Playlists'
        const heading = await screen.findByRole('heading', { level: 1, name: 'Your Playlists' });
        expect(heading).toBeInTheDocument();

    // should render heading of level 2 showing total playlist count
    const expectedLeft = Math.min(limit, playlistsData.total);
    const countRe = new RegExp(`${expectedLeft}\\s*Playlists\\s*of\\s*${playlistsData.total}\\s*Playlists`);
    const countHeading = await screen.findByText(countRe);
    expect(countHeading).toBeInTheDocument();

        // verify each playlist item rendered, don't check details here as covered in PlaylistItem tests
        for (const playlist of playlistsData.items) {
            expect(await screen.findByTestId(`playlist-item-${playlist.id}`)).toBeInTheDocument();
        }
    });


    test('displays total playlists count from the API', async () => {
        // Render the PlaylistsPage
        renderPlaylistsPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // The PlaylistsPage renders "<displayed> Playlists of <total> Playlists"
        // Use a regex to tolerate whitespace/newlines in the rendered output
        const expectedLeft2 = Math.min(limit, playlistsData.total);
        const totalRe = new RegExp(`${expectedLeft2}\\s*Playlists\\s*of\\s*${playlistsData.total}\\s*Playlists`);
        const heading = await screen.findByText(totalRe);

        // It should be present and have the correct class
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('playlists-count');
    });

    test('displays singular label when only one playlist exists', async () => {
        // Mock API to return a single playlist
        const single = { items: [ { id: 'only1', name: 'Only Playlist', images: [{ url: 'https://via.placeholder.com/56' }], owner: { display_name: 'User' }, tracks: { total: 1 }, external_urls: { spotify: 'https://open.spotify.com/playlist/only1' } } ], total: 1 };
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockResolvedValue({ data: single, error: null });

        // Render the PlaylistsPage
        renderPlaylistsPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // Expect "1 Playlist of 1 Playlist"
        const singularRe = new RegExp(`1\\s*Playlist\\s*of\\s*1\\s*Playlist`);
        const heading = await screen.findByText(singularRe);
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('playlists-count');

        // cleanup this override mock so other tests keep the default
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockResolvedValue({ data: playlistsData, error: null });
    });

    test('shows 0 playlists when API returns none', async () => {
        // Mock API to return no playlists
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockResolvedValue({ data: { items: [], total: 0 }, error: null });

        // Render the PlaylistsPage
        renderPlaylistsPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // Expect "0 Playlists of 0 Playlists"
        const zeroRe = new RegExp(`0\\s*Playlists\\s*of\\s*0\\s*Playlists`);
        const heading = await screen.findByText(zeroRe);
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveClass('playlists-count');
    });


    test('displays error message on fetchUserPlaylists error', async () => {
        // Mock fetchUserPlaylists to return error
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockResolvedValue({ data: { items: [], total: 0 }, error: 'Failed to fetch playlists' });

        // Render the PlaylistsPage
        renderPlaylistsPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // verify error message displayed
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Failed to fetch playlists');
    });

    test('displays error message on fetchUserPlaylists failure', async () => {
        // Mock fetchUserPlaylists to return error
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockRejectedValue(new Error('Network error'));

        // Render the PlaylistsPage
        renderPlaylistsPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // verify error message displayed
        const alert = await screen.findByRole('alert');
        expect(alert).toHaveTextContent('Network error');
    });

    test('redirects to login on token expiration', async () => {
        // Mock fetchUserPlaylists to return token expired error
        jest.spyOn(spotifyApi, 'fetchUserPlaylists').mockResolvedValue({ playlists: [], error: 'The access token expired' });

        // Render the PlaylistsPage
        renderPlaylistsPage();

        // Wait for loading to finish
        await waitForLoadingToFinish();

        // Verify redirection to login page
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('verify styling and accessibility attributes using role', async () => {
        // Render the PlaylistsPage
        renderPlaylistsPage();

        // wait for loading to finish
        await waitForLoadingToFinish();

        // should have section landmark with appropriate class names
        const region = screen.getByRole('region', { name: `Your Playlists` });
        expect(region).toHaveClass('playlists-container', 'page-container');

        // should have heading level 1 with appropriate class name
        const heading1 = screen.getByRole('heading', { level: 1, name: `Your Playlists` });
        expect(heading1).toHaveClass('playlists-title', 'page-title');

    // should have heading level 2 with appropriate class name
    const expectedLeft3 = Math.min(limit, playlistsData.total);
    const heading2Re = new RegExp(`${expectedLeft3}\\s*Playlists\\s*of\\s*${playlistsData.total}\\s*Playlists`);
    const heading2 = screen.getByText(heading2Re);
    expect(heading2).toHaveClass('playlists-count');

        // should have ordered list with appropriate class name
        const list = screen.getByRole('list');
        expect(list).toHaveClass('playlists-list');
    });
});
