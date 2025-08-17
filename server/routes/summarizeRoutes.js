import { Router } from "express";
import fetch from "node-fetch";
const router = Router();

// POST /api/summarize
router.post("/", async (req, res) => {
  try {
    const { transcript = "", prompt = "" } = req.body;
    if (!transcript && !prompt) return res.status(400).json({ error: "Provide transcript or prompt" });

    const userContent = `Instruction: ${prompt}\n\nTranscript:\n${transcript}`;

    // If GEMINI key present, call Google Gemini API
    if (process.env.GEMINI_API_KEY) {
      const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      console.log(`Using Gemini model: ${model}`); // Debug log
      console.log('Sending request to Gemini...'); // Debug log

      const requestBody = {
        contents: [{
          parts: [{
            text: `You are an assistant that summarizes meeting transcripts and business documents into clear, structured outputs. Focus on key insights, actionable items, and important details.\n\n${userContent}`
          }]
        }],
        generationConfig: {
          temperature: parseFloat(process.env.GEMINI_TEMPERATURE || "0.2"),
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const r = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await r.text();
      console.log(`Gemini response status: ${r.status}`); // Debug log

      if (!r.ok) {
        console.error("Gemini API error:", r.status, responseText);
        return res.status(502).json({ 
          error: "LLM provider error", 
          details: responseText,
          suggestion: "Check your GEMINI_API_KEY environment variable"
        });
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        return res.status(502).json({ error: "Invalid response from LLM provider" });
      }

      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      
      if (!summary) {
        console.error("No summary content in response:", data);
        return res.status(502).json({ error: "Empty response from LLM provider" });
      }

      return res.json({ summary });
    }

    // Fallback (no API key): simple heuristic summary
    const lines = transcript.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const firstLines = lines.slice(0, 8).join("\n");
    const fallback = `Fallback summary (no LLM key):\n\n${firstLines}`;
    return res.json({ summary: fallback });
  } catch (err) {
    console.error("Summarize error:", err);
    return res.status(500).json({ error: "Failed to generate summary" });
  }
});

export default router;