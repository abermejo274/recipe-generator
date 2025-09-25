export async function generateRecipe(ingredients, style) {
    const r = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, style })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data.recipe;
}