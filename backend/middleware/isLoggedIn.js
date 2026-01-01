import { User } from "../models/user.model.js";

export default async function isLoggedIn(req, res, next) {
  try {
    if (req.path === "/api/token") {
      return next();
    }

    const userId = req.query.userId || req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        loggedIn: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(401).json({
        loggedIn: false,
        message: "Invalid user",
      });
    }

    if (!user.access_token_expires_at) {
      return res.status(401).json({
        loggedIn: false,
        message: "No active session",
      });
    }

    if (user.access_token_expires_at < Date.now()) {
      return res.status(401).json({
        loggedIn: false,
        message: "Session expired",
      });
    }

    // Attach minimal user context
    req.user = {
      _id: user._id,
      spotify_id: user.spotify_id,
    };

    next();
  } catch (err) {
    console.error("isLoggedIn error:", err);
    return res.status(500).json({
      loggedIn: false,
      message: "Internal auth error",
    });
  }
}
