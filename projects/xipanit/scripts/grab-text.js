// Function to grab text
export async function grabText(randomFlag) {
    console.log("Running grabText version 022825_0205");
    console.log(`Grabbing text, randomFlag is ${randomFlag}`);
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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                date: currentDate,
                random_flag: randomFlag
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