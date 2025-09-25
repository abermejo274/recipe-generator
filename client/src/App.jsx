import React, { useState, useEffect } from "react";
import { generateRecipe } from "./api";
import { IngredientInput } from "./components/IngredientInput.jsx";
import { StyleSelect } from "./components/StyleSelect.jsx";
import { RecipeDisplay } from "./components/RecipeDisplay.jsx";
import { Loader } from "./components/Loader.jsx";
import "./styles/enhanced.css";

const STYLES = [
    { key: "ramsay", label: "Gordon Ramsay" },
    { key: "japanese", label: "Japanese" },
    { key: "mexican", label: "Mexican" },
    { key: "italian", label: "Italian" },
    { key: "indian", label: "Indian" },
    { key: "mediterranean", label: "Mediterranean" },
    { key: "minimalist", label: "Minimalist" }
];

export default function App() {
    const [ingredients, setIngredients] = useState("");
    const [style, setStyle] = useState("ramsay");
    const [includeNutrition, setIncludeNutrition] = useState(true);
    const [loading, setLoading] = useState(false);
    const [recipe, setRecipe] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        document.title = "Cook Smart | Recipe Generator";
    }, []);

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
            const r = await generateRecipe(ingredients, style, includeNutrition);
            setRecipe(r);
        } catch (err) {
            setError(err?.message || "Error generating recipe.");
        } finally {
            setLoading(false);
        }
    }

    function reset() {
        setIngredients("");
        setRecipe("");
        setError("");
    }

    function handleCopy() {
        if (!recipe) return;
        navigator.clipboard.writeText(recipe);
    }

    function handleDownload() {
        if (!recipe) return;
        const blob = new Blob([recipe], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recipe.txt";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="app-shell">
            <header className="app-header" aria-label="Cook Smart">
                <div className="brand">
                    <div className="logo-mark" role="img" aria-label="Cook Smart logo">
                        🍲
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-title">
                            <span className="brand-primary">Cook</span>
                            <span className="brand-secondary">Smart</span>
                        </h1>
                        <p className="tagline">AI Recipe Generator</p>
                    </div>
                </div>
            </header>

            <main className="app-main app-main--split">
                <section className="panel panel-form">
                    <form onSubmit={submit} className="recipe-form" noValidate>
                        <div className="field">
                            <label className="field-label" htmlFor="ingredients-input">
                                Ingredients
                            </label>
                            <IngredientInput
                                id="ingredients-input"
                                value={ingredients}
                                onChange={setIngredients}
                            />
                            <p className="hint">
                                Comma or line separated (e.g. chicken, lemon, garlic).
                            </p>
                        </div>

                        <div className="field row">
                            <label className="field-label" htmlFor="style-select">
                                Style
                            </label>
                            <StyleSelect
                                id="style-select"
                                value={style}
                                onChange={setStyle}
                                styles={STYLES}
                            />
                        </div>

                        <div className="field checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={includeNutrition}
                                    onChange={(e) => setIncludeNutrition(e.target.checked)}
                                />{" "}
                                Include nutrition facts
                            </label>
                        </div>

                        <div className="actions">
                            <button className="btn primary" disabled={loading}>
                                {loading ? "Working..." : "Generate"}
                            </button>
                            <button
                                type="button"
                                className="btn ghost"
                                onClick={reset}
                                disabled={loading && !ingredients}
                            >
                                Reset
                            </button>
                        </div>

                        {error && (
                            <div className="alert error" aria-live="assertive">
                                {error}
                            </div>
                        )}
                        {loading && (
                            <div className="loader-wrap">
                                <Loader />
                            </div>
                        )}
                    </form>
                </section>

                <section className="panel panel-output">
                    <div className="panel-header">
                        <h2>Result</h2>
                        <div className="panel-tools">
                            <button
                                className="btn small"
                                disabled={!recipe}
                                onClick={handleCopy}
                            >
                                Copy
                            </button>
                            <button
                                className="btn small"
                                disabled={!recipe}
                                onClick={handleDownload}
                            >
                                Download
                            </button>
                        </div>
                    </div>

                    <div
                        className={`output-surface ${
                            !recipe && !loading ? "empty" : ""
                        }`}
                        aria-live="polite"
                    >
                        {recipe ? (
                            <RecipeDisplay recipe={recipe} onCopy={handleCopy} />
                        ) : !loading ? (
                            <div className="placeholder">
                                <p>✨ Your generated recipe will appear here.</p>
                                <p className="muted">
                                    Add ingredients, choose a style & generate.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </section>
            </main>

            <footer className="app-footer">
                <span>h_AI_ck Day 2025</span>
            </footer>
        </div>
    );
}
