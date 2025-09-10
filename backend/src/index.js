import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import mongoose from "mongoose";

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/url_shortener";

async function start() {
  try {
    await mongoose.connect(MONGO_URI, { });
    // Add a simple check: crash immediately if not connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error("❌ MongoDB not connected");
    }

    // Optional: health check endpoint
    app.get("/pingdb", async (req, res) => {
      try {
        await mongoose.connection.db.admin().ping();
        res.json({ connected: true });
      } catch (err) {
        res.status(500).json({ connected: false, error: err.message });
      }
    });
    const server = http.createServer(app);
    server.listen(PORT, () => {
      // do not use console.log per requirement - but startup message is fine to omit
    });
  } catch (err) {
    // do not print to console per requirement; rethrow to crash
    throw err;
  }
}

start();