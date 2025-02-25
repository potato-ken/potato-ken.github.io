document.addEventListener('DOMContentLoaded', function() {
    
    // LOGIC TO LOAD DAILY TEXT
    grabDailyText();
    // // LOGIC FOR WHEN ORIGINAL LANGUAGE IS CHANGED
    // // Event listeners to update text when the dropdowns change
    // sourceLangSelect.addEventListener('change', updateTranslationText);
    // targetLangSelect.addEventListener('change', updateTranslationText);

    // LOGIC FOR GRADING TRANSLATION WHEN SUBMIT BUTTON IS CLICKED
    const submitButton = document.getElementById('submitButton');

    if (submitButton) {
        submitButton.addEventListener('click', async function () {
            await gradeTranslation();
        });
    }
});

const post_call_headers = {
    "Content-Type": "application/json"
}

// Function to grab daily text
async function grabDailyText() {
    console.log("Running grabDailyText version 022025_1504");
    console.log("Grabbing daily text");
    const sourceText = document.getElementById("sourceSeg")
    const currentDate = new Date().toLocaleDateString("en-CA", { // Get California timezone date in YYYY-MM-DD format
        timeZone: "America/Los_Angeles",
        year: "numeric", 
        month: "2-digit", 
        day: "2-digit"
    });
    
    console.log("Sending request to API Gateway, grab-daily-text endpoint");
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/grab-daily-text';    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: post_call_headers,
            body: JSON.stringify({
                date: currentDate,
                random_flag: "true"
            }),
            mode: 'cors'
        });

        const data = await response.json();
        console.log("API response:", data);
        
        sourceText.textContent = data.text; //Set sourceSeg text to API response
        sourceText.style.backgroundColor = '#e6ffe6';
    } catch (error) {
        sourceText.textContent = `Error: ${error.message}`;
        sourceText.style.backgroundColor = '#ffe6e6';
    }
}

let wordData = null; // Initialize wordData as null (not generated yet)
let currentHintLevel = 0; // Track the current hint level
let activeModal = null; // Track the active translation modal

// Function to generate hints
async function generateHints() {
    console.log("Running generateHints version 022425_0142");
    console.log("Generating hints");
    
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');

    const sourceLang = sourceLangSelect.options[sourceLangSelect.selectedIndex].text;
    const targetLang = targetLangSelect.options[targetLangSelect.selectedIndex].text;
    const sourceSeg = document.getElementById('sourceSeg').textContent;
    // [!] Trying to run this right after generating the text, but that can be tricky since we'll need to run this again if they change the language

    
    console.log("Sending request to API Gateway, generate-hints endpoint");
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/generate-hints';    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: post_call_headers,
            body: JSON.stringify({
                source_lang: sourceLang,
                target_lang: targetLang,
                source_seg: sourceSeg
            }),
            mode: 'cors'
        });

        const data = await response.json();
        console.log("API response:", data);
        
        return data.hints;
    } catch (error) {
        // [!] Need to add something here to console log a fail?
        return null;
    }
}

// Function to process source text and wrap hint words
function processText(wordData) {
    console.log("Processing text after receiving hints data:", wordData);
    const paragraph = document.getElementById('sourceSeg');
    let text = paragraph.innerHTML;

    console.log("Retrieved original text:", text);
    // Wrap target words in spans with data attributes
    wordData.forEach(wordInfo => {
        const regex = new RegExp(`\\b${wordInfo.word}\\b`, 'g');
        text = text.replace(regex, `<span class="word" data-difficulty="${wordInfo.difficulty}" data-translation="${wordInfo.translation}">${wordInfo.word}</span>`);
    });

    console.log("Processed text:", text);
    paragraph.innerHTML = text;
}

// Highlight words of a specific difficulty level
function highlightWords(level) {
    document.querySelectorAll(`.word[data-difficulty="${level}"]`).forEach(word => {
        word.classList.add('highlight');
    });
}

// Handle hint button clicks
// Need to handlw spam clicking??
document.getElementById('hintButton').addEventListener('click', () => {
    console.log("Hint button clicked, current level is ", currentHintLevel + 1);
    if (currentHintLevel === 0) {
        console.log("First hint click, generating hint then processing text, then highlighting first level of hints");
        generateHints()
        .then(wordData => {
            processText(wordData); // Process the text with the generated wordData
            currentHintLevel ++;
            highlightWords(currentHintLevel); // Highlight words of the current level
        })
        .catch(error => {
            console.error("Error with generateHints function:", error);
        });

    } else if (currentHintLevel === 3) {
        console.log("Hints have been used up, no action");
        return;
    } else {
        console.log("Hint clicked again, highlighting next level of hints");
        currentHintLevel ++;
        highlightWords(currentHintLevel); // Highlight words of the current level
    }
});

// Handle word clicks
document.getElementById('sourceSeg').addEventListener('click', (e) => {
    const word = e.target;
    console.log("Clicked on word ", word);
    if (!word.classList.contains('word')) return;

    // Remove existing modal
    if (activeModal) activeModal.remove();

    // Create new modal if the clicked word matches the current hint level
    if (word.dataset.difficulty == currentHintLevel) {
        console.log("Word clicked matches current hint level");
        const modal = document.createElement('div');
        modal.className = 'translation-modal';
        modal.textContent = word.dataset.translation;

        // Position modal
        const rect = word.getBoundingClientRect();
        modal.style.left = `${rect.left}px`;
        modal.style.top = `${rect.bottom + 5}px`;

        document.body.appendChild(modal);
        activeModal = modal;

        // Close modal on click outside or on the same word
        const clickHandler = (e) => {
            if (!modal.contains(e.target)) {
                modal.remove();
                document.removeEventListener('click', clickHandler);
                activeModal = null;
            }
        };
        document.addEventListener('click', clickHandler);
    }
});

// Function to update the heading text when language is changed
function updateOriginalText() {
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');

    const sourceLang = sourceLangSelect.options[sourceLangSelect.selectedIndex].text;
    const targetLang = targetLangSelect.options[targetLangSelect.selectedIndex].text;
    heading.innerHTML = `Can you translate it from <strong>${sourceLang}</strong> to <strong>${targetLang}</strong>?`;
}

// Function to submit translated text and return the grading
async function gradeTranslation() {
    console.log("Running gradeTranslation version 022125_1735");
    console.log("Submit button clicked!");
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    const sourceLang = sourceLangSelect.options[sourceLangSelect.selectedIndex].text;
    const targetLang = targetLangSelect.options[targetLangSelect.selectedIndex].text;
    const targetSeg = document.getElementById('targetSeg').value;
    const sourceSeg = document.getElementById('sourceSeg').textContent;
    const responseDiv = document.getElementById('response');
    
    console.log("Sending request to API Gateway, grade-translation endpoint");
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/grade-translation';    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: post_call_headers,
            body: JSON.stringify({
                user_email: "test@email.com",
                source_lang: sourceLang,
                target_lang: targetLang,
                source_seg: sourceSeg,
                target_seg: targetSeg
            }),
            mode: 'cors'
        });

        const data = await response.json();
        console.log("API response:", data);
        responseDiv.innerHTML = `You scored ${data.score}/100. ${data.feedback}<br><br>The correct translation would've been:<br><strong>${data.correct_translation}</strong>`;
        responseDiv.style.backgroundColor = '#e6ffe6';
    } catch (error) {
        responseDiv.textContent = `Error: ${error.message}`;
        responseDiv.style.backgroundColor = '#ffe6e6';
    }
}