async function gradeTranslation() {
    const targetSeg = document.getElementById('targetSeg').value;
    const responseDiv = document.getElementById('response');
    
    // Replace with your actual API endpoint
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/grade-translation';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_email: "test@email.com",
                source_lang: "English",
                target_lang: "Spanish",
                source_seg: "And don’t forget carneval. Hugo’s son let go of the balloon he was holding in his hand. And when I took the first step to try and catch it, a motorbike ran over my foot. I haven’t been able to walk properly for months.",
                target_seg: targetSeg
            })
        });

        const data = await response.json();
        responseDiv.textContent = `You scored ${data.score}/100. ${data.feedback}`;
        responseDiv.style.backgroundColor = '#e6ffe6';
    } catch (error) {
        responseDiv.textContent = `Error: ${error.message}`;
        responseDiv.style.backgroundColor = '#ffe6e6';
    }
}