import fetch from "node-fetch";
export async function generateRecipe({ apiKey, messages }) {
    if (!apiKey) {
        return `### Mock Recipe
**Title:** Fridge Fusion Bowl
**Serves:** 2
**Time:** 15 min
**Ingredients:** (Approx.)
- Mixed available items
- Oil, salt, seasoning
**Steps:**
1. Chop and unify textures.
2. Heat pan, add oil.
3. Sear aromatics.
4. Add bulk items, season.
5. Adjust moisture (splash water or stock).
6. Finish with acidity/fresh herb.
**Chef's Tip:** Layer salt gradually for balance.`;
    }
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.9,
            messages
        })
    });
    if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Upstream ${resp.status}: ${body}`);
    }
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content || "No content.";
}