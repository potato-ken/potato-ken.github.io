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
    console.log("Running grabDailyText version 022025_0516");
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
                current_date: currentDate
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
    console.log("Running gradeTranslation version 022025_0516");
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
        responseDiv.textContent = `You scored ${data.score}/100. ${data.feedback}`;
        responseDiv.style.backgroundColor = '#e6ffe6';
    } catch (error) {
        responseDiv.textContent = `Error: ${error.message}`;
        responseDiv.style.backgroundColor = '#ffe6e6';
    }
}