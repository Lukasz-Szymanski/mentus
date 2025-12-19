const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const models = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey; // Dummy call to init
    // Actually, let's use the correct listModels call if available or just try known ones.
    // The SDK doesn't always expose listModels directly on the main class in older versions, 
    // but let's try a direct approach to "gemini-1.5-flash" first.
    
    console.log("Checking API Key:", process.env.GOOGLE_API_KEY ? "Present" : "Missing");
    
    // Let's try to generate content with a simple prompt to test validity
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("Success! gemini-1.5-flash is working.");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
    
    try {
        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("Success! gemini-pro is working.");
    } catch (e) {
        console.error("Error with gemini-pro:", e.message);
    }
  }
}

listModels();
