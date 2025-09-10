import express from "express";
import cors from "cors";
import shortRoutes from "./routes/shortRoutes.js";
import customLogger from "./middleware/customLogger.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// trust proxy (so req.ip reads x-forwarded-for when behind proxies)
app.set("trust proxy", true);

app.use(express.json());
app.use(cors());

// mandatory logging middleware (writes to file). Replace with pre-test logger if provided.
app.use(customLogger);

// routes
app.use("/api", shortRoutes);

// redirection route (must be after /api to avoid collisions)
import ShortUrl from "./models/ShortUrl.js";
app.get("/:shortcode", async (req, res, next) => {
  try {
    const { shortcode } = req.params;
    // delegate to controller logic:
    const doc = await ShortUrl.findOne({ shortcode }).exec();
    if (!doc) {
      return res.status(404).json({ error: "Shortcode not found" });
    }

    const now = new Date();
    if (doc.expiryAt && doc.expiryAt <= now) {
      return res.status(410).json({ error: "Shortlink expired" });
    }

    // update click metadata
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const referrer = req.get("referer") || req.get("referrer") || null;
    const geo = require("geoip-lite").lookup(ip) || {};
    const country = geo.country || null;

    doc.clicks = (doc.clicks || 0) + 1;
    doc.clicksMeta.push({
      timestamp: new Date(),
      referrer,
      ip,
      country
    });
     await doc.save();

    res.redirect(doc.originalUrl);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

export default app;