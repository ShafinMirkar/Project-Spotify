import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
dotenv.config();

const app = express();
const ai = new GoogleGenAI({});

const CLIENT_iD = process.env.CLIENT_ID
const CLIENT_sECRET = process.env.CLIENT_SECRET

app.get("/", (_,res)=>{
  res.send("Helloeeewww")
})

app.get("/api/token", async(req,res)=>{
    const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_iD + ":" + CLIENT_sECRET).toString("base64"),
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  const token = data.access_token;
  console.log(`Token generated ${token}`)
  let allSongs = [];
  try {
      const { user_id } = req.query;
      console.log(`user id  generated ${user_id}`)
      const playlistsRes = await fetch(
        `https://api.spotify.com/v1/users/${user_id}/playlists?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const playlists = await playlistsRes.json();
      console.log(playlists)
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
  
  console.log(`all songs generated ${allSongs}`)
  const promptString = allSongs
  .map(pl => {
    const tracksText = pl.tracks.map(track => `- ${track}`).join("\n");
    return `Playlist: ${pl.playlistName}\n${tracksText}`;
  })
  .join("\n\n");

  const resp = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: `here is a list of songs playlist \n ${promptString} \n I want you to roast this listener according to his song playlists and his music choice.`,
  config: {
    temperature: 1.2,
    systemInstruction: "Directly give the roast, dont add any sentences before. dont use any symbols, emojis etc, just plain text. roast each playlist individually. Create a one-liner for each playlist and then a complete roast of the entire playlist. You can get personal. Be brutal.",
  },
  });
  console.log(resp.text);
  res.json({ text: resp.text });
})

app.listen(5000, ()=>{
    console.log(`App listens on Port: ${5000}`)
})