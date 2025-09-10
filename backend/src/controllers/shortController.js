import ShortUrl from "../models/ShortUrl.js";
import { generateShortcode } from "../utils/shortcodeGenerator.js";
import isValidUrl from "../utils/validateUrl.js";

const DEFAULT_VALIDITY_MINUTES = parseInt(process.env.DEFAULT_VALIDITY_MINUTES || "30", 10);
const MIN_LEN = parseInt(process.env.SHORTCODE_MIN_LENGTH || "4", 10);
const MAX_LEN = parseInt(process.env.SHORTCODE_MAX_LENGTH || "10", 10);

export async function createShort(req, res, next) {
  try {
    const { url, validity, shortcode: customShortcode } = req.body;

    if (!url || typeof url !== "string" || !isValidUrl(url)) {
      return res.status(400).json({ error: "Malformed input: 'url' is required and must be a valid URL" });
    }

    const validityMinutes = Number.isInteger(validity) ? validity : DEFAULT_VALIDITY_MINUTES;
    if (!Number.isInteger(validityMinutes) || validityMinutes <= 0) {
      return res.status(400).json({ error: "Invalid 'validity' - must be integer minutes > 0" });
    }
      let finalShortcode;
    if (customShortcode) {
      if (typeof customShortcode !== "string") {
        return res.status(400).json({ error: "Invalid 'shortcode' - must be a string (alphanumeric)" });
      }
      const sc = customShortcode.trim();
      const alphaNum = /^[A-Za-z0-9]+$/;
      if (!alphaNum.test(sc) || sc.length < MIN_LEN || sc.length > MAX_LEN) {
        return res.status(400).json({ error: `Invalid shortcode. Must be alphanumeric and length between ${MIN_LEN}-${MAX_LEN}` });
      }
      // collision check
      const exists = await ShortUrl.findOne({ shortcode: sc }).exec();
      if (exists) {
        return res.status(409).json({ error: "Shortcode collision: provided shortcode already exists" });
      }
      finalShortcode = sc;
    } else {
      // generate unique shortcode (retry loop)
      let tries = 0;
      while (tries < 5) {
        const candidate = generateShortcode();
        // ensure candidate respects length constraints
        if (candidate.length < MIN_LEN) continue;
        const exists = await ShortUrl.findOne({ shortcode: candidate }).exec();
        if (!exists) {
             finalShortcode = candidate;
          break;
        }
        tries++;
      }
      if (!finalShortcode) {
        // last resort: loop until unique (rare)
        let candidate;
        do {
          candidate = generateShortcode();
        } while (await ShortUrl.findOne({ shortcode: candidate }));
        finalShortcode = candidate;
      }
    }
const expiryAt = new Date(Date.now() + validityMinutes * 60 * 1000);

    const doc = new ShortUrl({
      shortcode: finalShortcode,
      originalUrl: url,
      expiryAt,
      clicks: 0,
      clicksMeta: []
    });

    await doc.save();

    const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    return res.status(201).json({
      shortLink: `${base}/${finalShortcode}`,
      expiry: expiryAt.toISOString()
    });
  } catch (err) {
    next(err);
  }
}export async function getStats(req, res, next) {
  try {
    const { shortcode } = req.params;
    const doc = await ShortUrl.findOne({ shortcode }).lean().exec();
    if (!doc) {
      return res.status(404).json({ error: "Shortcode not found" });
    }

    return res.json({
      shortLink: `${process.env.BASE_URL || `${req.protocol}://${req.get("host")}`}/${doc.shortcode}`,
      originalUrl: doc.originalUrl,
      createdAt: doc.createdAt,
      expiryAt: doc.expiryAt,
      clicks: doc.clicks || 0,
      clicksMeta: doc.clicksMeta || []
    });
  } catch (err) {
    next(err);
  }
}