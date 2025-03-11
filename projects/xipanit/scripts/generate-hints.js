// Function to generate hints
export async function generateHints(sourceLang, targetLang, sourceSeg) {
    console.log("Running generateHints version 022825_1151");
    console.log("Generating hints");
    
    console.log("Sending request to API Gateway, generate-hints endpoint");
    const API_URL = 'https://qtesp091j5.execute-api.us-east-2.amazonaws.com/Prod/generate-hints';    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
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