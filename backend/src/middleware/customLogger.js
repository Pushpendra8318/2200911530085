import fs from "fs";
import path from "path";

const LOG_PATH = process.env.LOG_FILE_PATH || "./logs/access.log";

// ensure folder exists
const dir = path.dirname(LOG_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Custom logging middleware.
 * Writes a JSON line per request with basic metadata.
 * IMPORTANT: does not use console.log (assignment requirement).
 */
export default function customLogger(req, res, next) {
  const start = Date.now();

  // when response finishes, write log line
  res.on("finish", () => {
    const duration = Date.now() - start;
    const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
    const logEntry = {
         timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip,
      userAgent: req.get("User-Agent") || null
    };
    // append as JSON line
    try {
      fs.appendFileSync(LOG_PATH, JSON.stringify(logEntry) + "\n");
    } catch (err) {
      // write failure: can't console.log; swallow silently
    }
  });

  next();
}