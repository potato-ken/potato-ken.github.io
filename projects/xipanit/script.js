document.addEventListener('DOMContentLoaded', function() {
    
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
    console.log("Running gradeTranslation version 021725_1731");
    console.log("Submit button clicked!");
    const sourceLangSelect = document.getElementById('sourceLang');
    const targetLangSelect = document.getElementById('targetLang');
    const sourceLang = sourceLangSelect.options[sourceLangSelect.selectedIndex].text;
    const targetLang = targetLangSelect.options[targetLangSelect.selectedIndex].text;
    const targetSeg = document.getElementById('targetSeg').value;
    const sourceSeg = document.getElementById('sourceSeg').textContent;
    const responseDiv = document.getElementById('response');
    
    console.log("Sending request to API Gateway");
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/grade-translation';    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_email: "test@email.com",
                source_lang: sourceLang,
                target_lang: targetLang,
                source_seg: sourceSeg,
                target_seg: targetSeg
            })
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