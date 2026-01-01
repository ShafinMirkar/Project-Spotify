import {User} from '../models/user.model.js'
async function registerUser(
  access_token,
  access_token_expires_at
) {
  try {
    if (!access_token) {
      throw new Error("Missing Spotify access token");
    }

    const res = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Spotify /me failed: ${res.status} ${errText}`);
    }

    const data = await res.json();

    const spotify_id = data.id;
    const username = data.display_name;
    const email = data.email;

    if (!spotify_id) {
      throw new Error("Spotify user id missing from /me");
    }


    console.log(
      "User's data",
      spotify_id,
      username,
      email
    );

    let user = await User.findOne({ spotify_id });

    if (!user) {
      user = await User.create({
        spotify_id,
        email,
        username,
        access_token,
        access_token_expires_at,
      });
      setImmediate(() =>
      registerUserItems(user._id, access_token)
      );
    } else {
      user.access_token = access_token;
      user.access_token_expires_at = access_token_expires_at;
      await user.save();
    }

    return user._id;

  } catch (err) {
    console.error("registerUser failed:", err);
    throw err; 
  }
}

async function getUserSongs(access_token){
  let allSongs = [];
  try {
      const playlistsRes = await fetch(
        `https://api.spotify.com/v1/me/playlists?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        }
      );
      const playlists = await playlistsRes.json();
      for (const playlist of playlists.items){
        const tracksRes = await fetch(
          `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const tracksData = await tracksRes.json();

        const trackNames = tracksData.items
          .map(item => item.track?.name)
          .filter(Boolean);

        allSongs.push({
          playlistName: playlist.name,
          tracks: trackNames
        });
      }    
    } catch (error) {
      console.log("error while fetching playlist", error);
    }
  
  return allSongs;
}
async function getUserTopItems(access_token,type){
  const url = `https://api.spotify.com/v1/me/top/${type}`;
  try {
    const response = await fetch(
    url,
    {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    }
    )
    if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
    }

  const data = await response.json();
  return data.items;

  } catch (error) {
    console.error(`error while fetching ${type}`, error);
  }
}

async function registerUserItems(userId, access_token){
  function mapTrack(track) {
  return {
    spotify_id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    album: track.album?.name,
    popularity: track.popularity
  };
  }
  function mapArtist(artist) {
    return {
      spotify_id: artist.id,
      name: artist.name,
      genres: artist.genres,
      popularity: artist.popularity
    };
  }
  const songsArray = await getUserSongs(access_token);
  const topTracksRaw = await getUserTopItems(access_token, "tracks");
  const topArtistsRaw = await getUserTopItems(access_token, "artists");

  const allSongs = songsArray.map(mapTrack);
  const topTracks = topTracksRaw.map(mapTrack);
  const topArtists = topArtistsRaw.map(mapArtist);

  await User.findByIdAndUpdate(
    userId,
    {
      all_songs: allSongs,
      top_tracks: topTracks,
      top_artists: topArtists
    },
    { new: true }
  );

  console.log("✅ User items saved successfully");
}

// async function getValidSpotifyAccessToken(userId) {
//   const user = await db.users.findById(userId);

//   if (!user) throw new Error("User not found");

//   if (Date.now() < user.access_token_expires_at) {
//     return user.spotify_access_token;
//   }

//   try {
//     const refreshed = await refreshSpotifyToken(user.spotify_refresh_token);

//     await db.users.update(userId, {
//       spotify_access_token: refreshed.access_token,
//       access_token_expires_at: Date.now() + refreshed.expires_in * 1000,
//       spotify_refresh_token: refreshed.refresh_token ?? user.spotify_refresh_token
//     });

//     return refreshed.access_token;

//   } catch (err) {
//     await db.users.update(userId, {
//       spotify_access_token: null,
//       spotify_refresh_token: null,
//       access_token_expires_at: null
//     });

//     throw new Error("SPOTIFY_REAUTH_REQUIRED");
//   }
// }
// async function refreshSpotifyToken(refreshToken) {
//   const params = new URLSearchParams({
//     grant_type: "refresh_token",
//     refresh_token: refreshToken,
//     client_id: process.env.SPOTIFY_CLIENT_ID
//   });

//   const response = await fetch("https://accounts.spotify.com/api/token", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded"
//     },
//     body: params
//   });

//   if (!response.ok) {
//     throw new Error("Failed to refresh Spotify token");
//   }

//   return await response.json();
// }
export {
    registerUser,
}