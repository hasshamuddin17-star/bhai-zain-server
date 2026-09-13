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

    const