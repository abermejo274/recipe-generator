export async function generateRecipe(ingredients, style, includeNutrition = true) {
    const res = await fetch("http://localhost:3000/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, style, includeNutrition })
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
    }
    const data = await res.json();
    return data.recipe;
}