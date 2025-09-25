import React, { useState } from "react";
import { generateRecipe } from "./api";
import { IngredientInput } from "./components/IngredientInput.jsx";
import { StyleSelect } from "./components/StyleSelect.jsx";
import { RecipeDisplay } from "./components/RecipeDisplay.jsx";
import { Loader } from "./components/Loader.jsx";
const STYLES = [
    { key: "ramsay", label: "Gordon Ramsay" },
    { key: "pirate", label: "Pirate" },
    { key: "shakespeare", label: "Shakespeare" },
    { key: "scifi", label: "Sci-Fi" },
    { key: "minimalist", label: "Minimalist" }
];
export default function App() {
    const [ingredients, setIngredients] = useState("");
    const [style, setStyle] = useState("ramsay");
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState("");
    const [error, setError] = useState("");
    async function submit(e) {
        e.preventDefault();
        setError("");
        setRecipe("");
        if (!ingredients.trim()) {
            setError("Enter ingredients.");
            return;
        }
        setLoading(true);
        try {
            const r = await generateRecipe(ingredients, style);
            setRecipe(r);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="shell">
            <h1>Recipe Generator - Cook Smart</h1>
            <form onSubmit={submit} className="panel">
                <IngredientInput value={ingredients} onChange={setIngredients} />
                <div className="row">
                    <label>Style:</label>
                    <StyleSelect value={style} onChange={setStyle} styles={STYLES} />
                </div>
                <button disabled={loading}>{loading ? "Working..." : "Generate"}</button>
                {error && <div className="error">{error}</div>}
                {loading && <Loader />}
            </form>
            <RecipeDisplay recipe={recipe} onCopy={() => navigator.clipboard.writeText(recipe)} />
        </div>
    );
}