const fs = require('fs');

try {
    let content = fs.readFileSync('browser_seed_data.json', 'utf8');

    // We need to fix unescaped quotes inside "input", "output", and "explanation" values.
    // Example: "input": "s = "a", t = "a"", -> "input": "s = \"a\", t = \"a\""
    
    // A function to escape quotes inside a captured string
    function escapeInnerQuotes(match, key, innerString, endChar) {
        const escaped = innerString.replace(/"/g, '\\"');
        return `"${key}": "${escaped}"${endChar}`;
    }

    // Match "input": "...",  or "output": "..."\n
    // The regex looks for "key": " then everything up to ",\n or "\n
    content = content.replace(/"(input|output|explanation)":\s*"(.*?)"(,\n|\n)/g, escapeInnerQuotes);

    // Also need to fix the case where there is no comma but just a newline (last item in object)
    // Wait, the regex above handles (,\n|\n).

    fs.writeFileSync('browser_seed_data.json', content, 'utf8');
    
    // Test if it parses now
    JSON.parse(content);
    console.log("JSON successfully fixed and parsed!");
} catch (e) {
    console.error("Still invalid JSON:", e.message);
}
