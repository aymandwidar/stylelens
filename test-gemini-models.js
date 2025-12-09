import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels(apiKey) {
    if (!apiKey) {
        console.error('Please provide an API key as an argument');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Access the model service directly to list models
        // Note: The SDK might not expose listModels directly on genAI instance in all versions,
        // but let's try to get a model and see if we can query it or if we get a specific error.
        // Actually, for browser/node SDK, we often just try to instantiate a model.
        // The best way to "list" is often to try a known working model or check the error response carefully.

        console.log("Attempting to connect with key...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Testing generation with gemini-1.5-flash...");
        const result = await model.generateContent("Test");
        const response = await result.response;
        console.log("Success! gemini-1.5-flash is available.");
        console.log("Response:", response.text());

    } catch (error) {
        console.error("Error connecting or listing models:", error);

        // Try fallback models
        const modelsToTry = ["gemini-pro", "gemini-1.5-pro", "gemini-1.0-pro"];
        for (const modelName of modelsToTry) {
            try {
                console.log(`\nTrying fallback model: ${modelName}...`);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`Success! ${modelName} works.`);
                return;
            } catch (e) {
                console.log(`Failed with ${modelName}: ${e.message}`);
            }
        }
    }
}

// Get key from arguments
const apiKey = process.argv[2];
listModels(apiKey);
