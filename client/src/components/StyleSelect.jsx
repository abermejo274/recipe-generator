import React from "react";
export function StyleSelect({ value, onChange, styles }) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            {styles.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
    );
}