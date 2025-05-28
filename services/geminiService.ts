
import { GoogleGenAI, Chat, GenerateContentResponse, CreateChatParameters } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';

export const initChatSession = (ai: GoogleGenAI, systemInstructionText: string): Chat => {
  const chatParams: CreateChatParameters = {
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: systemInstructionText,
    }
    // No thinkingConfig, default is fine for narrative.
  };
  const chat = ai.chats.create(chatParams);
  return chat;
};

export const sendMessageToChat = async (chat: Chat, messageText: string): Promise<GenerateContentResponse> => {
  try {
    const result = await chat.sendMessage({ message: messageText });
    return result;
  } catch (error) {
    console.error("Gemini API error in sendMessageToChat:", error);
    // Re-throw or handle more gracefully if needed by the UI
    // For now, let the caller handle it.
    throw error; 
  }
};
