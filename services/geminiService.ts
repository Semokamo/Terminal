
import { GoogleGenAI, Chat, GenerateContentResponse, CreateChatParameters, Content, Part } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import { Message, ChatTargetId, Sender } from '../types';

export const convertMessagesToGeminiHistory = (messages: Message[]): Content[] => {
  return messages
    .filter(msg => msg.text && !msg.isLoading && !msg.isError && (msg.sender === Sender.User || msg.sender === Sender.Lily))
    .map(msg => {
      const role = msg.sender === Sender.User ? 'user' : 'model';
      // Ensure msg.text is not undefined before using it
      const textContent = msg.text ?? '';
      const part: Part = { text: textContent };
      return {
        role,
        parts: [part],
      };
    });
};

export const initChatSession = (ai: GoogleGenAI, systemInstructionText: string, history?: Content[]): Chat => {
  const chatParams: CreateChatParameters = {
    model: GEMINI_MODEL_NAME,
    config: {
      systemInstruction: systemInstructionText,
    }
    // No thinkingConfig, default is fine for narrative.
  };
  if (history && history.length > 0) {
    chatParams.history = history;
  }
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

export const serializeChatHistory = (chatHistories: Record<ChatTargetId, Message[]>): Record<ChatTargetId, any[]> => {
  const serializedHistories = {} as Record<ChatTargetId, any[]>;
  for (const chatKey in chatHistories) {
    serializedHistories[chatKey as ChatTargetId] = chatHistories[chatKey as ChatTargetId].map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
    }));
  }
  return serializedHistories;
};

export const deserializeChatHistoryTimestamps = (serializedChatHistories: Record<ChatTargetId, any[]>): Record<ChatTargetId, Message[]> => {
  const deserializedHistories = {} as Record<ChatTargetId, Message[]>;
  for (const chatKey in serializedChatHistories) {
    deserializedHistories[chatKey as ChatTargetId] = serializedChatHistories[chatKey as ChatTargetId].map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp as string),
    }));
  }
  return deserializedHistories;
};

export const serializeTimestamps = (timestamps: Record<ChatTargetId, number>): Record<ChatTargetId, string> => {
    const serializedTimestamps = {} as Record<ChatTargetId, string>;
    for (const key in timestamps) {
        if (timestamps[key as ChatTargetId]) { // Ensure timestamp exists
          serializedTimestamps[key as ChatTargetId] = new Date(timestamps[key as ChatTargetId]).toISOString();
        }
    }
    return serializedTimestamps;
};

export const deserializeTimestamps = (serializedTimestamps: Record<ChatTargetId, string>): Record<ChatTargetId, number> => {
    const deserializedTimestamps = {} as Record<ChatTargetId, number>;
    for (const key in serializedTimestamps) {
        if (serializedTimestamps[key as ChatTargetId]) { // Ensure timestamp string exists
          deserializedTimestamps[key as ChatTargetId] = new Date(serializedTimestamps[key as ChatTargetId]).getTime();
        }
    }
    return deserializedTimestamps;
};
