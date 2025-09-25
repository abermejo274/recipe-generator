// client/src/components/RecipeDisplay.jsx
import React, { useMemo } from "react";
import "../styles/enhanced.css";

// --- helpers --------------------------------------------------
function stripMdFormatting(str = "") {
    return str
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .trim();
}

function extractSection(lines, headerRegex) {
    const idx = lines.findIndex(l => headerRegex.test(stripMdFormatting(l)));
    if (idx === -1) return { index: -1, items: [] };
    const items = [];
    for (let i = idx + 1; i < lines.length; i++) {
        const rawLine = lines[i];
        const line = stripMdFormatting(rawLine);
        if (!line.trim()) break;
        if (/^#{1,6}\s+\w+/i.test(line)) break;
        if (/^(ingredients?|steps?|directions?|method|nutrition)/i.test(line.replace(/^#{1,6}\s*/, ""))) break;
        items.push(line);
    }
    return { index: idx, items };
}

function cleanList(raw) {
    return raw
        .map(l => l.replace(/^[-*]\s+/, "").replace(/^\d+[.)]\s+/, "").trim())
        .filter(Boolean);
}

function parseRecipe(raw) {
    if (!raw) return { title: "", ingredients: [], steps: [], nutrition: [], raw: "" };
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    const first = stripMdFormatting(lines[0] || "");
    const title = first.startsWith("#")
        ? stripMdFormatting(first.replace(/^#+\s*/, ""))
        : (!/^ingredients?/i.test(first) ? first : "");

    const ingredientsSec = extractSection(lines, /^(#{1,6}\s*)?\**ingredients?\**\b/i);
    const stepsSec = extractSection(lines, /^(#{1,6}\s*)?\**(steps?|instructions|directions|method)\**\b/i);
    const nutritionSec = extractSection(
        lines,
        /^(#{1,6}\s*)?\**nutrition facts?\**\s*\(?.*per.*serving.*\)?/i
    );

    const ingredients = cleanList(ingredientsSec.items).map(stripMdFormatting);
    const steps = cleanList(stepsSec.items).map(stripMdFormatting);

    const nutrition = cleanList(nutritionSec.items)
        .map(line => {
            const m =
                line.match(/^([^:\-]+)[:\-]\s*(.+)$/) ||
                line.match(/^(.+?)\s{1,}([\d].*)$/);
            return m
                ? {
                    label: stripMdFormatting(m[1].trim()),
                    value: stripMdFormatting(m[2].trim())
                }
                : null;
        })
        .filter(Boolean);

    return { title, ingredients, steps, nutrition, raw: raw || "" };
}

// --- components ------------------------------------------------
function NutritionFacts({ nutrition }) {
    if (!nutrition.length) return null;
    return (
        <div
            className="nutrition-block recipe-panel"
            role="group"
            aria-label="Nutrition Facts (per serving)"
        >
            <div className="nutrition-block__head">
                <span className="nutrition-emoji" aria-hidden="true">🧪</span>
                <h5>{stripMdFormatting("Nutrition Facts (per serving)")}</h5>
            </div>
            <ul className="nutrition-list">
                {nutrition.map(n => (
                    <li key={n.label}>
                        <span className="nf-label">{n.label}</span>
                        <span className="nf-value">{n.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// --- main display ----------------------------------------------
export function RecipeDisplay({ recipe, onCopy }) {
    const { title, ingredients, steps, nutrition, raw } = useMemo(() => parseRecipe(recipe), [recipe]);
    const hasStructure = ingredients.length || steps.length || nutrition.length;

    function formatStep(text) {
        return stripMdFormatting(
            text
                .replace(/^\d+[.)]\s*/, "")
                .trim()
        );
    }

    return (
        <div className="recipe-display">
            {title && <h3 className="recipe-title">{title}</h3>}

            {(ingredients.length > 0 || nutrition.length > 0) && (
                <div className="recipe-meta-row">
                    {ingredients.length > 0 && (
                        <section
                            className="recipe-panel ingredients-panel"
                            data-section="ingredients"
                        >
                            <h4 className="section-heading">Ingredients</h4>
                            <ul className="ingredients-list">
                                {ingredients.map(ing => (
                                    <li key={ing}>{ing}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                    <NutritionFacts nutrition={nutrition} />
                </div>
            )}

            {steps.length > 0 && (
                <section className="recipe-section" data-section="instructions">
                    <h4 className="section-heading">Instructions</h4>
                    <ol className="instructions-list" aria-label="Preparation steps">
                        {steps.map((s, i) => (
                            <li key={i}>{formatStep(s)}</li>
                        ))}
                    </ol>
                </section>
            )}

            {!hasStructure && <pre className="raw-recipe">{raw}</pre>}

            <div className="recipe-actions">
                <button
                    type="button"
                    className="btn small"
                    onClick={onCopy}
                    aria-label="Copy full recipe"
                >
                    Copy All
                </button>
            </div>
        </div>
    );
}
