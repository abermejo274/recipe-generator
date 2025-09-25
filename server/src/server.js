import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { STYLES } from "./styles.js";
import { sanitize } from "./utils/sanitize.js";
import { rateLimit } from "./utils/rateLimit.js";
import { getCached, setCached, cacheStats } from "./utils/cache.js";
import { generateRecipe } from "./openaiClient.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
app.use(cors());
app.use(express.json());
function buildMessages(ingredients, styleKey) {
    const persona = STYLES[styleKey] || STYLES.ramsay;
    return [
        {
            role: "system",
            content: `You output safe, feasible recipes with: Title, Serves, Time, Ingredients (quantified), Steps (6-9), Chef's Tip. Style persona: ${persona}. If essentials missing, suggest substitutions. Use markdown.`
        },
        { role: "user", content: `Available ingredients: ${ingredients}` }
    ];
}
app.get("/health", (_req, res) => {
    res.json({
        ok: true,
        styles: Object.keys(STYLES),
        cacheEntries: cacheStats(),
        mockMode: !OPENAI_API_KEY
    });
});
app.post("/api/recipe", rateLimit, async (req, res) => {
    try {
        const raw = req.body?.ingredients || "";
        const style = req.body?.style || "ramsay";
        const cleaned = sanitize(raw);
        if (!cleaned) {
            return res.status(400).json({ error: "Missing ingredients." });
        }
        if (!STYLES[style]) {
            return res.status(400).json({ error: "Unsupported style." });
        }
        const key = `${cleaned}|${style}`;
        const cached = getCached(key);
        if (cached) return res.json({ recipe: cached, cached: true });
        const messages = buildMessages(cleaned, style);
        const recipe = await generateRecipe({ apiKey: OPENAI_API_KEY, messages });
        setCached(key, recipe);
        res.json({ recipe, cached: false });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Generation failed." });
    }
});
app.listen(PORT, () => {
    console.log(`Server listening http://localhost:${PORT} (mode: ${OPENAI_API_KEY ? "live" : "mock"})`);
});