const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2dhdGV3YXkuYXBpYnJhc2lsLmlvL2FwaS9vYXV0aC9leGNoYW5nZSIsImlhdCI6MTc3MTY5MDMwMywiZXhwIjoxODAzMjI2MzAzLCJuYmYiOjE3NzE2OTAzMDMsImp0aSI6IlM2UzRhWWVidURxM0dPeEEiLCJzdWIiOiIyMTI2MyIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJ1c2VyX2lkIjoxNjM2NCwiZW1haWwiOiJhcnR1ci51bWJlbGlub0BhcGlicmFzaWwuY29tLmJyIn0.N5OlX-r8ATRwvjv04wEMgYdwlkuZDy3WMrO9JEZgIkc";

async function testConnection() {
    try {
        const response = await fetch("https://gateway.apibrasil.io/api/v2/vehicles/dados", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                plate: "ABC1234" // Plate for testing
            })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Connection Error:", error);
    }
}

testConnection();
