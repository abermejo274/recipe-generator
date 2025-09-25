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

function buildMessages(ingredients, styleKey, includeNutrition) {
    const persona = STYLES[styleKey] || STYLES.ramsay;
    const nutritionDirective = includeNutrition
        ? "Add a final markdown section titled 'Nutrition Facts (per serving)' with: Calories, Protein (g), Carbs (g), Fat (g), Fiber (g), and 2-3 Key Micronutrients (name and amount). Use a simple bullet list. Provide reasonable estimates only."
        : "Do NOT add nutrition facts.";
    return [
        {
            role: "system",
            content:
                `You output safe, feasible recipes with sections: Title, Serves, Time, Ingredients (quantified list), Steps (6-9 concise numbered steps), Chef's Tip. Style persona: ${persona}. If essentials missing suggest substitutions. Use clean markdown. ` +
                nutritionDirective
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
        const includeNutrition = req.body?.includeNutrition !== false; // default true
        const cleaned = sanitize(raw);
        if (!cleaned) return res.status(400).json({ error: "Missing ingredients." });
        if (!STYLES[style]) return res.status(400).json({ error: "Unsupported style." });

        const key = `${cleaned}|${style}|nutri:${includeNutrition}`;
        const cached = getCached(key);
        if (cached) return res.json({ recipe: cached, cached: true });

        const messages = buildMessages(cleaned, style, includeNutrition);
        const recipe = await generateRecipe({ apiKey: OPENAI_API_KEY, messages });
        setCached(key, recipe);
        res.json({ recipe, cached: false });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Generation failed." });
    }
});

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} mode=${OPENAI_API_KEY ? "live" : "mock"}`);
});