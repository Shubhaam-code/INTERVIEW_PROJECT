import axios from "axios";

export const askAi = async (messages) => {
  try {
    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is empty.");
    }

    // API Request
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",

        // yaha 'messages' hona chahiye
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // AI Response
    const content = response?.data?.choices?.[0]?.message?.content; //message ki according response dega

    // Empty response check
    if (!content) {
      throw new Error("AI returned empty response.");
    }

    return content;
  } catch (error) {
    console.error(
      "OpenRouter Error:",
      error.response?.data || error.message
    );

    throw new Error("OpenRouter API Error");
  }
};