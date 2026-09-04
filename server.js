const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "100kb"
  })
);


/* ==========================================
   GEMINI
========================================== */

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {

  console.error(
    "❌ GEMINI_API_KEY is not configured."
  );

}

const ai =  
  new GoogleGenAI({
    apiKey: apiKey
  });


/* ==========================================
   HEALTH CHECK
========================================== */

app.get("/", (req, res) => {

  res.json({
    status: "online",
    app: "Bhai Zain",
    message: "Bhai Zain cloud server is running."
  });

});


/* ==========================================
   ASK AI
========================================== */

app.post("/ask", async (req, res) => {

  const startTime =
    Date.now();


  try {

    const message =
      typeof req.body.message === "string"
        ? req.body.message.trim()
        : "";


    const history =
      Array.isArray(req.body.history)
        ? req.body.history
        : [];


    /* --------------------------------------
       VALIDATE MESSAGE
    -------------------------------------- */

    if (!message) {

      return res.status(400).json({

        error:
          "Message is required."

      });

    }


    /* --------------------------------------
       LIMIT HISTORY
       Prevents unnecessarily huge requests.
    -------------------------------------- */

    const safeHistory =
      history
        .slice(-30)
        .filter(item =>

          item &&
          typeof item.text === "string" &&
          (
            item.role === "user" ||
            item.role === "model"
          )

        );


    /* --------------------------------------
       BUILD GEMINI CONTENT
    -------------------------------------- */

    const contents =
      safeHistory.map(item => ({

        role:
          item.role,

        parts: [

          {
            text:
              item.text
          }

        ]

      }));


    /*
      Safety fallback:
      If frontend sends no history,
      send the current message.
    */

    if (contents.length === 0) {

      contents.push({

        role: "user",

        parts: [

          {
            text:
              message
          }

        ]

      });

    }


    /* --------------------------------------
       GEMINI REQUEST
    -------------------------------------- */

    const response =
      await ai.models.generateContent({

        model:
          "gemini-3.6-flash",

        contents:
          contents,

        config: {

          systemInstruction:
            `
You are Bhai Zain, a fast, helpful and friendly AI assistant.

Important behavior:

1. Understand the conversation history.
2. Remember previous messages in the current conversation.
3. If the user asks something like:
   "Maine upar kya kaha tha?"
   use the conversation history to answer.
4. Do not claim that the current message is the first message when history is provided.
5. Answer naturally in the user's language.
6. The user often uses Roman Urdu, so Roman Urdu is preferred when appropriate.
7. Keep answers clear and reasonably concise unless the user asks for detail.
8. Never invent previous messages that are not present in the conversation history.
9. You are Bhai Zain, not Gemini.
            `,

          temperature:
            0.4,

          maxOutputTokens:
            700

        }

      });


    /* --------------------------------------
       RESPONSE
    -------------------------------------- */

    const reply =
      response.text?.trim() ||
      "Bhai Zain ko response nahi mila.";


    console.log(
      `⚡ AI response: ${Date.now() - startTime}ms`
    );


    return res.json({

      reply:
        reply

    });


  } catch (error) {

    console.error(
      "❌ Gemini Error:",
      error
    );


    return res.status(500).json({

      error:
        "AI request failed."

    });

  }

});


/* ==========================================
   SERVER
========================================== */

const PORT =
  process.env.PORT || 3000;


app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `⚡ Bhai Zain cloud server running on port ${PORT}`
    );

  }
);
