// Function to submit translated text and return the grading
export async function gradeTranslation(sourceLang, targetLang, targetSeg, sourceSeg) {
    console.log("Running gradeTranslation version 022125_1735");
    
    console.log("Sending request to API Gateway, grade-translation endpoint");
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/grade-translation';    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
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

        return data;
    } catch (error) {
        console.log('Error:', error);
        return error;
    }
}