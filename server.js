const express = require("express"); const 
cors = require("cors"); const { 
GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10kb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.post("/ask", async (req, res) => {
  const startTime = Date.now();

  try {
    const message = req.body.message?.trim();

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: message,

      config: {
        systemInstruction:
          "You are Bhai Zain, a fast and helpful AI assistant. " +
          "Answer clearly and directly. Keep responses concise unless the user asks for detail.",

        temperature: 0.4,

        maxOutputTokens: 500
      }
    });

    const reply =
      response.text?.trim() ||
      "Bhai Zain ko response nahi mila.";

    console.log(
      `AI response: ${Date.now() - startTime}ms`
    );

    res.json({
      reply: reply
    });

  } catch (error) {

    console.error("Gemini Error:", error);

    res.status(500).json({
      error: "AI request failed"
    });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("⚡ Bhai Zain optimized server running on port 3000");
});

