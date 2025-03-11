// Function to process source text and wrap hint words
export function formatHints(textData, hintData) {
    console.log("Processing text after receiving hints data:", hintData);
    const paragraph = document.getElementById('sourceSeg');
    let text = textData.text;

    console.log("Retrieved original text:", textData);

    // Sort words so we can process longer words first, preventing nested replacements. For example, if there are translation for "out of nowhere" and "nowhere", "out of nowhere" will be processed first and that word will no longer be translated so "nowhere" will not interfere with formatting.
    hintData.sort((a, b) => b.word.length - a.word.length);

    // Loop through each translated word/phrase
    hintData.forEach(({ word, difficulty, translation }) => {
        const regex = new RegExp(`(\\b${word}\\b)(?![^<]*>|[^<>]*<\/span>)`, 'g');
        text = text.replace(regex, (_, match) =>
            `<span class="hint-word" data-difficulty="${difficulty}" data-translation="${translation}">${match}</span>`
        );
    });

    console.log("Processed text:", text);
    return text;
}