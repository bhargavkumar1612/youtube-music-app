import React, { useEffect, useState } from 'react';

const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_YOUTUBE_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const App = () => {
  const [gapiLoaded, setGapiLoaded] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const loadGapi = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => gapi.load('client:auth2', initClient);
      document.body.appendChild(script);
    };

    const initClient = () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
      }).then(() => {
        setGapiLoaded(true);
      });
    };

    loadGapi();
  }, []);

  const signIn = () => {
    gapi.auth2.getAuthInstance().signIn().then(loadPlaylists);
  };

  const loadPlaylists = async () => {
    const response = await gapi.client.youtube.playlists.list({
      part: 'snippet,contentDetails',
      mine: true,
      maxResults: 10,
    });
    setPlaylists(response.result.items);
  };

  const loadVideos = async (playlistId) => {
    const res = await gapi.client.youtube.playlistItems.list({
      part: 'snippet',
      playlistId: playlistId,
      maxResults: 10,
    });
    const firstVideoId = res.result.items[0]?.snippet?.resourceId?.videoId;
    if (firstVideoId) setSelectedVideo(firstVideoId);
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">🎵 My YouTube Music App</h1>
      {!gapiLoaded ? (
        <p>Loading...</p>
      ) : (
        <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={signIn}>
          Sign in with Google
        </button>
      )}

      {playlists.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Your Playlists</h2>
          <ul className="mt-4 space-y-2">
            {playlists.map((pl) => (
              <li key={pl.id}>
                <button
                  className="text-blue-700 underline"
                  onClick={() => loadVideos(pl.id)}
                >
                  {pl.snippet.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedVideo && (
        <div className="mt-6">
          <iframe
            width="360"
            height="215"
            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="YouTube player"
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default App;
