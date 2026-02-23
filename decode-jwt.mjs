const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2dhdGV3YXkuYXBpYnJhc2lsLmlvL2FwaS9vYXV0aC9leGNoYW5nZSIsImlhdCI6MTc3MTY5MDMwMywiZXhwIjoxODAzMjI2MzAzLCJuYmYiOjE3NzE2OTAzMDMsImp0aSI6IlM2UzRhWWVidURxM0dPeEEiLCJzdWIiOiIyMTI2MyIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJ1c2VyX2lkIjoxNjM2NCwiZW1haWwiOiJhcnR1ci51bWJlbGlub0BhcGlicmFzaWwuY29tLmJyIn0.N5OlX-r8ATRwvjv04wEMgYdwlkuZDy3WMrO9JEZgIkc";

const [header, payload, signature] = token.split('.');

const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

console.log("Decoded JWT Payload:", JSON.stringify(decodedPayload, null, 2));
