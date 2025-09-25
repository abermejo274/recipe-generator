export function sanitize(text = "") {
    return text
        .replace(/[\r\n]+/g, " ")
        .replace(/[^a-zA-Z0-9,\.\- _]/g, "")
        .trim()
        .slice(0, 500);
}