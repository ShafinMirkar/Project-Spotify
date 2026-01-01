import mongoose, { Schema } from "mongoose";
import { trackSchema } from "./tracks.model.js";
import { artistSchema } from "./artists.model.js";

const userSchema = new Schema(
  {
    spotify_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
    },

    email: {
      type: String,
    },

    access_token: {
      type: String,
    },

    refresh_token: {
      type: String,
    },

    access_token_expires_at: {
      type: Number,
    },

    all_songs: {
      type: [trackSchema],
      default: [],
    },

    top_tracks: {
      type: [trackSchema],
      default: [],
    },

    top_artists: {
      type: [artistSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
