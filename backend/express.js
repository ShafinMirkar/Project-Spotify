import express from "express";
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from "./db/index.js"
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { registerUser } from "./controller/user.controller.js";
import isLoggedIn  from "./middleware/isLoggedIn.js";
import {User} from './models/user.model.js'

const app = express();
dotenv.config();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
const ai = new GoogleGenAI({});

app.use("/api", limiter);
app.use(
  cors({
    origin: process.env.REDIRECT_URI,
  })
);
app.use(express.json());
app.use(isLoggedIn);

const roastLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 4,
  message: {
    error: "You’ve already been roasted enough today. Come back tomorrow 🔥",
  },
});

app.post("/api/token", async(req,res)=>{
  const { code, code_verifier } = req.body;
  if (!code || !code_verifier) {
    return res.status(400).json({ error: "Missing code or verifier" });
  }

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI,
    code_verifier,
  });

  try {
  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    }
  );

  const data = await response.json();
  const access_token = data.access_token;

  const expiresAt = data.expires_in;
  const access_token_expires_at = Date.now() + expiresAt * 1000;

  console.log(`Token generated ${access_token}`);

  const userId = await registerUser(access_token,access_token_expires_at);
  console.log("User id generated -> ",userId);
  res.json({userId});
  } catch (error) {
    console.log("Errrorrrrr", error)
  }
})

app.get("/api/roast", roastLimiter,async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId missing" });
  }

  const user = await User.findById(userId);
  

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  console.log("Roast request made by ", user.username);
  const { all_songs, top_tracks, top_artists } = user;

  if (!top_tracks.length || !top_artists.length) {
    return res.status(400).json({ error: "Not enough data to roast" });
  }

  const topTracksString = top_tracks
    .slice(0, 5)
    .map((t, i) => `${i + 1}. ${t.name} by ${t.artists.join(", ")}`)
    .join("\n");

  const topArtistsString = top_artists
    .slice(0, 5)
    .map((a, i) => `${i + 1}. ${a.name}`)
    .join("\n");

  const allSongsString = all_songs
    .slice(0, 10)
    .map(s => s.name)
    .join(", ");

  const resp = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: `here is the user's top artists ${topArtistsString} \n here is his top tracks ${topTracksString}\n here is a list of songs playlist \n ${allSongsString} \n  I want you to roast this listener according to his top tracks, top artists, song playlists and his music choice.`,
  config: {
    temperature: 1.2,
    systemInstruction: "Directly give the roast, dont add any sentences before. You can get personal. Be really really brutal. Make it more street like. dont use any symbols, emojis etc, just plain text.create *only* three mid-size paragraphs of roast one for each, first his playlist, then top tracks then top artists.Make each paragraph of less than 70 words",
  },
  });
  console.log(resp.text);
  res.json({ text: resp.text });

})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8081, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed", err);
})
