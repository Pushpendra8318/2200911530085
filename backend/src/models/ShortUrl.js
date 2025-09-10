import mongoose from "mongoose";

const ClickMetaSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: { type: String, default: null },
  ip: { type: String, default: null },
  country: { type: String, default: null }
}, { _id: false });

const ShortUrlSchema = new mongoose.Schema({
  shortcode: { type: String, required: true, unique: true, index: true },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiryAt: { type: Date, required: true },
  clicks: { type: Number, default: 0 },
  clicksMeta: { type: [ClickMetaSchema], default: [] }
});

export default mongoose.model("ShortUrl", ShortUrlSchema);