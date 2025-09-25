import React from "react";
export function RecipeDisplay({ recipe, onCopy }) {
    if (!recipe) return null;
    return (
        <div className="result">
            <div className="result-header">
                <h2>Result</h2>
                <button onClick={onCopy}>Copy</button>
            </div>
            <div className="recipe" dangerouslySetInnerHTML={{ __html: mdToHTML(recipe) }} />
        </div>
    );
}
function mdToHTML(md) {
    return md
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        .replace(/\*\*(.*?)\*\*/gim, "<b>$1</b>")
        .replace(/\*(.*?)\*/gim, "<i>$1</i>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n\- (.*)/g, "<ul><li>$1</li></ul>")
        .replace(/\n/g, "<br>");
}