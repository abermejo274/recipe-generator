import React from "react";
export function IngredientInput({ value, onChange }) {
    return (
        <textarea
            rows={4}
            placeholder="e.g. chicken thighs, garlic, rice, broccoli"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}