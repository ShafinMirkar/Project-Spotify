import mongoose, { Schema } from "mongoose";

export const artistSchema = new Schema(
  {
    spotify_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
    },
    popularity: {
      type: Number,
    },
  },
  { _id: false }
);
