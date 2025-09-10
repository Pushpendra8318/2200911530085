import express from "express";
import { createShort, getStats } from "../controllers/shortController.js";

const router = express.Router();

// POST /api/shorten
router.post("/shorten", createShort);

// GET /api/shorturls/:shortcode
router.get("/shorturls/:shortcode", getStats);

export default router;