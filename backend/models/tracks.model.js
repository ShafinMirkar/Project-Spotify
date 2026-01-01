import mongoose, { Schema } from "mongoose";

export const trackSchema = new Schema(
  {
    spotify_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    artists: {
      type: [String], // artist names
      required: true,
    },
    album: {
      type: String,
    },
    popularity: {
      type: Number,
    },
  },
  { _id: false } // 👈 prevents auto _id for each track
);
