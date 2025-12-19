const API_KEY = process.env.GOOGLE_API_KEY;
require('dotenv').config();

async function listModels() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
      console.error("No API KEY found in .env");
      return;
  }
  
  console.log("Querying Google API for available models...");
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  
  if (!response.ok) {
      console.error("Error listing models:", await response.text());
      return;
  }
  
  const data = await response.json();
  if (data.models) {
      console.log("--- AVAILABLE MODELS ---");
      data.models.forEach(m => {
          if (m.supportedGenerationMethods.includes("generateContent")) {
              console.log(`- ${m.name}`);
          }
      });
      console.log("------------------------");
  } else {
      console.log("No models found.");
  }
}

listModels();
