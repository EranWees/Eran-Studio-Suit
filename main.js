async function generate(promptText) {
    try {
        const res = await fetch("/.netlify/functions/gemini", {
            method: "POST",
            body: JSON.stringify({ prompt: promptText })
        });
        const data = await res.json();
        console.log("AI output:", data.output);
        return data.output;
    } catch (err) {
        console.error("Error:", err);
    }
}
