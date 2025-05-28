
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import AndroidHomeScreen from './components/AndroidHomeScreen';
import EscapeRoomChat from './components/EscapeRoomChat';
import ApiKeyBanner from './components/ApiKeyBanner';
import NavigationControls from './components/NavigationControls';
import InitialLoadingScreen from './components/InitialLoadingScreen';
import FilesPinScreen from './components/FilesPinScreen';
import FilesScreen from './components/FilesScreen';
import OverviewScreen from './components/OverviewScreen';
import BrowserScreen from './components/BrowserScreen';
import SkullsSystemScreen from './components/SkullsSystemScreen'; 
import IntroScreen from './components/IntroScreen';
import GameStartScreen from './components/GameStartScreen';
import SystemInitiatingScreen from './components/SystemInitiatingScreen';
import CalculatorScreen from './components/CalculatorScreen'; 
import MacOSTopBar from '@/components/MacOSTopBar';
import SignOutConfirmationDialog from './components/SignOutConfirmationDialog'; 
import SigningOutScreen from './components/SigningOutScreen'; 
import CreditsScreen from './components/CreditsScreen'; 
import { 
    API_KEY_ERROR_MESSAGE, SYSTEM_INSTRUCTION, LILY_TYPING_MESSAGE, 
    IMAGE_GENERATION_ERROR_MESSAGE, RELOCATION_UNIT_CHAT_HISTORY, 
    CHAT_CONTACT_LIST, LILY_CHAT_SPEAKER_NAME, GALLERY_PIN, 
    SKULLS_SYSTEM_PASSWORD, CHUTE_KEYPAD_SEQUENCE, NO_CHAT_SELECTED_DISPLAY_NAME
} from './constants';
import { Message, Sender, ChatTargetId, ChatContact, View as AppView, ChatTargetIdOrNull } from './types'; 
import { initChatSession, sendMessageToChat } from './services/geminiService';

type AppStatus = 'uninitialized' | 'initializing_api' | 'api_ready' | 'api_error';

export interface OverviewApp {
  id: AppView;
  title: string;
  status: string;
}

const GAME_NAME = "Terminal Echoes";

const initialChatHistoriesState: Record<ChatTargetId, Message[]> = {
  lily: [],
  relocation: [],
  subject32: [],
  subject33: [],
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('game_start');
  const [appStatus, setAppStatus] = useState<AppStatus>('uninitialized');
  const [aiInstance, setAiInstance] = useState<GoogleGenAI | null>(null);
  const [isApiKeyActuallyAvailable, setIsApiKeyActuallyAvailable] = useState<boolean>(false);

  const [chatHistories, setChatHistories] = useState<Record<ChatTargetId, Message[]>>(initialChatHistoriesState);
  const [activeChatTargetId, setActiveChatTargetId] = useState<ChatTargetIdOrNull>(null);
  const [isCurrentChatResponsive, setIsCurrentChatResponsive] = useState<boolean>(false);
  const [isLilyTyping, setIsLilyTyping] = useState<boolean>(false);
  const [lilyChatSession, setLilyChatSession] = useState<Chat | null>(null);
  const [lilyChatInitialized, setLilyChatInitialized] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [isOverviewVisible, setIsOverviewVisible] = useState<boolean>(false);
  const [activeAppsInOverview, setActiveAppsInOverview] = useState<OverviewApp[]>([]);

  const [browserCurrentUrl, setBrowserCurrentUrl] = useState<string>('');
  const [calculatorDisplayValue, setCalculatorDisplayValue] = useState<string>("0");

  const [filesUnlocked, setFilesUnlocked] = useState<boolean>(false); 
  const [skullsSystemUnlocked, setSkullsSystemUnlocked] = useState<boolean>(false);
  const [relocationEta, setRelocationEta] = useState<string>("Calculating...");

  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
    
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState<Record<ChatTargetId, number>>({
    lily: 0,
    relocation: 0,
    subject32: 0,
    subject33: 0,
  });

  const [messengerFirstOpenedThisSession, setMessengerFirstOpenedThisSession] = useState<boolean>(false);

  const MIN_TYPING_DELAY = 700;
  const MAX_TYPING_DELAY = 4000;
  const TYPING_DELAY_PER_CHAR = 40;

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  const calculateTypingDelay = (textLength: number): number => {
    return Math.min(MAX_TYPING_DELAY, Math.max(MIN_TYPING_DELAY, textLength * TYPING_DELAY_PER_CHAR));
  };

  const updateActiveApps = useCallback((view: AppView, title: string, status: string) => {
    setActiveAppsInOverview(prevApps => {
      let newApps = [...prevApps];
      if (view === 'files_unlocked') {
        newApps = newApps.filter(app => app.id !== 'files_locked');
      } else if (view === 'files_locked') {
        newApps = newApps.filter(app => app.id !== 'files_unlocked');
      }
      
      newApps = newApps.filter(app => app.id !== view);
      const newAppEntry: OverviewApp = { id: view, title, status };
      
      const order: AppView[] = ['chat', 'files_locked', 'files_unlocked', 'browser', 'calculator'];
      const sortedApps = [newAppEntry, ...newApps]
        .sort((a, b) => {
          const indexA = order.indexOf(a.id);
          const indexB = order.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return newApps.indexOf(a) - newApps.indexOf(b); 
          if (indexA === -1) return 1; 
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      return sortedApps;
    });
  }, []);

  const proceedToScenarioIntro = useCallback(() => setCurrentView('intro'), []);
  const proceedToSystemInitiating = useCallback(() => setCurrentView('system_initiating'), []);

  useEffect(() => {
    if (currentView === 'system_initiating') {
      const timer = setTimeout(() => setCurrentView('initial_load'), 4000);
      return () => clearTimeout(timer);
    }
  }, [currentView]);

  const initializeApi = useCallback(() => {
    setAppStatus('initializing_api');
    const key = process.env.API_KEY;
    if (key) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        setAiInstance(ai);
        setIsApiKeyActuallyAvailable(true);
        setAppStatus('api_ready');
        setCurrentView('home');
      } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
        setAppStatus('api_error');
        setIsApiKeyActuallyAvailable(false);
      }
    } else {
      setAppStatus('api_error');
      setIsApiKeyActuallyAvailable(false);
    }
  }, []);

  const initializeAllChats = useCallback(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0); 
    const formattedNextHourTime = nextHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRelocationEta(formattedNextHourTime); 

    let relocationLastTimestamp = 0;
    const relocationHistoryWithTimestamps = RELOCATION_UNIT_CHAT_HISTORY.map(msg => {
      let updatedText = msg.text;
      if (updatedText?.includes('[DYNAMIC_NEXT_HOUR_TIME]')) {
        updatedText = updatedText.replace('[DYNAMIC_NEXT_HOUR_TIME]', formattedNextHourTime);
      }
      const timestampDate = new Date(msg.timestamp);
      if (timestampDate.getTime() > relocationLastTimestamp) {
          relocationLastTimestamp = timestampDate.getTime();
      }
      return { ...msg, text: updatedText, timestamp: timestampDate }; 
    });

    setChatHistories(prev => ({
      ...prev, 
      relocation: relocationHistoryWithTimestamps,
      subject32: [], 
      subject33: [], 
    }));
    
    setLastMessageTimestamps(prev => ({...prev, relocation: relocationLastTimestamp || Date.now()}));

  }, []);

  useEffect(() => {
    if (appStatus === 'api_ready') {
      initializeAllChats();
    }
  }, [appStatus, initializeAllChats]);

  const parseGeminiResponse = useCallback((responseText: string): { segments: Array<{ type: 'text'; content: string } | { type: 'image_prompt'; content: string }> } => {
    const finalSegments: Array<{ type: 'text'; content: string } | { type: 'image_prompt'; content: string }> = [];
    const partBreakSegments = responseText.split('||PART_BREAK||');
    const imagePromptRegex = /\[IMAGE_PROMPT:\s*(.*?)\]/s; // Non-global, dotall

    const addTextSegments = (text: string) => {
        if (text.trim()) { // Process only if there's non-whitespace text
            const lines = text.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine) { // Add only non-empty trimmed lines
                    finalSegments.push({ type: 'text', content: trimmedLine });
                }
            }
        }
    };

    for (const part of partBreakSegments) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue; // Skip if the whole part (after trim) is empty

        const imageMatch = trimmedPart.match(imagePromptRegex);

        if (imageMatch && imageMatch[1]) {
            // Text before the image prompt
            const textBefore = trimmedPart.substring(0, imageMatch.index);
            addTextSegments(textBefore);

            // The image prompt itself
            finalSegments.push({ type: 'image_prompt', content: imageMatch[1].trim() });

            // Text after the image prompt
            const textAfter = trimmedPart.substring(imageMatch.index + imageMatch[0].length);
            addTextSegments(textAfter);
        } else {
            // No image prompt in this part, treat the whole part as text
            addTextSegments(trimmedPart);
        }
    }

    return { segments: finalSegments };
  }, []);

  const processAndDisplayLilyResponse = useCallback(async (responseText: string, initialCall: boolean = false) => {
    const { segments } = parseGeminiResponse(responseText);
    let typingMessageId = `lily-typing-${Date.now()}`;

    const addTypingIndicator = () => {
      typingMessageId = `lily-typing-${Date.now()}`;
      setChatHistories(prev => ({
        ...prev,
        lily: [...prev.lily.filter(m => !(m.isLoading && m.sender === Sender.Lily)), {
          id: typingMessageId,
          sender: Sender.Lily, 
          text: LILY_TYPING_MESSAGE,
          isLoading: true,
          timestamp: new Date(),
        }]
      }));
      setIsLilyTyping(true);
      if (!initialCall) updateActiveApps('chat', 'Messenger', LILY_TYPING_MESSAGE);
    };
    
    const removeTypingIndicator = () => {
       setChatHistories(prev => ({...prev, lily: prev.lily.filter(msg => msg.id !== typingMessageId)}));
       setIsLilyTyping(false);
    };

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (segment.type === 'text') {
            if(segment.content.trim()){ // This check might be redundant due to parseGeminiResponse now trimming
                addTypingIndicator();
                await new Promise(resolve => setTimeout(resolve, calculateTypingDelay(segment.content.length)));
                removeTypingIndicator();
                
                const newLilyMessage: Message = {
                    id: `lily-${Date.now()}-${i}`,
                    sender: Sender.Lily,
                    text: segment.content,
                    timestamp: new Date(),
                };
                setChatHistories(prev => {
                    const updatedLilyHistory = [...prev.lily, newLilyMessage];
                    if (!initialCall) {
                        const lilyTextMessagesCount = updatedLilyHistory.filter(m => m.sender === Sender.Lily && m.text && !m.isLoading).length;
                        updateActiveApps('chat', 'Messenger', `${lilyTextMessagesCount} messages from ${LILY_CHAT_SPEAKER_NAME}`);
                    }
                    return {...prev, lily: updatedLilyHistory};
                });
                setLastMessageTimestamps(prev => ({ ...prev, lily: newLilyMessage.timestamp.getTime() }));
            }
        } else if (segment.type === 'image_prompt') {
            if (!aiInstance) {
                 setChatHistories(prev => ({...prev, lily: [...prev.lily, { id: `lily-img-error-no-ai-${Date.now()}`, sender: Sender.Lily, text: IMAGE_GENERATION_ERROR_MESSAGE, isLoading: false, isError: true, timestamp: new Date() }]}));
                 continue;
            }
            const imageMessageId = `img-${Date.now()}-${i}`;
            const imageTimestamp = new Date();
            setChatHistories(prev => ({...prev, lily: [...prev.lily, {
                id: imageMessageId,
                sender: Sender.Lily,
                isLoading: true,
                timestamp: imageTimestamp,
            }]}));
            if (!initialCall) updateActiveApps('chat', 'Messenger', `${LILY_CHAT_SPEAKER_NAME} is sending an image...`);
            try {
                // For dynamic image generation:
                // const imageResponse = await aiInstance.models.generateImages({ model: 'imagen-3.0-generate-002', prompt: segment.content });
                // const imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
                const imageUrl = "https://via.placeholder.com/300x200.png?text=Dynamic+Image+Placeholder"; // Placeholder for now
                setChatHistories(prev => {
                    const updatedHistory = prev.lily.map(msg =>
                        msg.id === imageMessageId ? { ...msg, imageUrl, isLoading: false } : msg
                    );
                    if (!initialCall && i === segments.length - 1) { // If it's the last segment
                        const lilyTextMessagesCount = updatedHistory.filter(m => m.sender === Sender.Lily && m.text && !m.isLoading).length;
                        const lilyImageMessagesCount = updatedHistory.filter(m => m.sender === Sender.Lily && m.imageUrl).length;
                        updateActiveApps('chat', 'Messenger', `${lilyTextMessagesCount} messages, ${lilyImageMessagesCount} image(s)`);
                    }
                    return {...prev, lily: updatedHistory};
                });
                setLastMessageTimestamps(prev => ({ ...prev, lily: imageTimestamp.getTime() }));

            } catch (imgError) {
                console.error("Image generation error (dynamic):", imgError);
                 setChatHistories(prev => ({...prev, lily: prev.lily.map(msg =>
                    msg.id === imageMessageId ? { id: `lily-img-error-${Date.now()}`, sender: Sender.Lily, text: IMAGE_GENERATION_ERROR_MESSAGE, isLoading: false, isError: true, timestamp: new Date() } : msg
                )}));
            }
        }
        if (i < segments.length - 1 && segments[i+1].type === 'text' && segments[i+1].content.trim()) {
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400)); 
        }
    }
    setIsLilyTyping(false); 
  }, [aiInstance, parseGeminiResponse, updateActiveApps, calculateTypingDelay]);

  const initializeLilyChat = useCallback(async () => {
    if (!aiInstance || lilyChatInitialized) {
      if (!aiInstance) {
        setChatError("AI Service not initialized.");
        setChatHistories(prev => ({...prev, lily: [{ id: 'ai-init-error', sender: Sender.System, text: "Error: AI Service not initialized.", timestamp: new Date(), isError: true }]}));
      }
      return;
    }

    setLilyChatInitialized(true);
    setChatHistories(prev => ({...prev, lily: [] })); 
    setLastMessageTimestamps(prev => ({ ...prev, lily: 0})); 
    setChatError(null);
    setIsLilyTyping(false);
    updateActiveApps('chat', 'Messenger', `Chat with ${LILY_CHAT_SPEAKER_NAME}`);

    try {
      const newChat = initChatSession(aiInstance, SYSTEM_INSTRUCTION);
      setLilyChatSession(newChat);
    } catch (error) {
      console.error("Error initializing Lily chat session:", error);
      const errorText = `Error starting ${LILY_CHAT_SPEAKER_NAME} session: ${error instanceof Error ? error.message : String(error)}`;
      setChatError(errorText);
      setChatHistories(prev => ({...prev, lily: [...prev.lily, { id: `init-error-${Date.now()}`, sender: Sender.System, text: errorText, timestamp: new Date(), isError: true }]}));
      setLilyChatInitialized(false);
      updateActiveApps('chat', 'Messenger', 'Error starting chat');
    }
  }, [aiInstance, lilyChatInitialized, updateActiveApps]);

  const handleSwitchChatTarget = useCallback(async (targetId: ChatTargetId) => {
    setActiveChatTargetId(targetId);
    const contact = CHAT_CONTACT_LIST.find(c => c.id === targetId);
    setIsCurrentChatResponsive(contact ? contact.isResponsive : false);

    if (targetId === 'lily' && appStatus === 'api_ready' && !lilyChatInitialized && aiInstance) {
      await initializeLilyChat();
    }
    const status = contact ? (contact.description || `Chat with ${targetId === 'lily' ? LILY_CHAT_SPEAKER_NAME : contact.name}`) : 'No active chat';
    updateActiveApps('chat', 'Messenger', status);

  }, [appStatus, aiInstance, lilyChatInitialized, initializeLilyChat, updateActiveApps]);

  const navigateToChat = useCallback((targetId?: ChatTargetId) => {
    if (appStatus !== 'api_ready') {
      setCurrentView('home');
      return;
    }

    if (!messengerFirstOpenedThisSession) {
      setCurrentView('chat');
      setActiveChatTargetId(null);
      setIsCurrentChatResponsive(false);
      setMessengerFirstOpenedThisSession(true);
      updateActiveApps('chat', 'Messenger', 'Select a conversation');
    } else {
      setCurrentView('chat');
      const effectiveTargetId = targetId || activeChatTargetId || 'lily'; // Default to current or Lily if just opening
      if (effectiveTargetId) { // Ensure it's not null from activeChatTargetId
         handleSwitchChatTarget(effectiveTargetId);
      } else { // Should not happen if messengerFirstOpenedThisSession is true, but as a fallback
         handleSwitchChatTarget('lily');
      }
    }

    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [appStatus, isOverviewVisible, handleSwitchChatTarget, messengerFirstOpenedThisSession, activeChatTargetId, updateActiveApps]);


  useEffect(() => {
    if (currentView === 'chat' && activeChatTargetId === 'lily' && appStatus === 'api_ready' && !lilyChatInitialized && aiInstance) {
      initializeLilyChat();
    }
  }, [currentView, activeChatTargetId, appStatus, lilyChatInitialized, aiInstance, initializeLilyChat]);

  const navigateToHome = useCallback(() => {
    if (isOverviewVisible) setIsOverviewVisible(false);
    setCurrentView('home');
  }, [isOverviewVisible]);

  const navigateToFiles = useCallback(() => { 
    if (filesUnlocked) {
        setCurrentView('files_unlocked');
        updateActiveApps('files_unlocked', 'Files', 'Contents Unlocked');
    } else {
        setCurrentView('files_locked');
        updateActiveApps('files_locked', 'Files', 'PIN Required');
    }
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, updateActiveApps, filesUnlocked]);

  const handleFilesUnlock = useCallback((pin: string): boolean => { 
    if (pin === GALLERY_PIN) { 
      setFilesUnlocked(true);
      setCurrentView('files_unlocked');
      setActiveAppsInOverview(prevApps => {
        const otherApps = prevApps.filter(app => app.id !== 'files_locked' && app.id !== 'files_unlocked');
        return [{ id: 'files_unlocked', title: 'Files', status: 'Contents Unlocked' }, ...otherApps];
      });
      return true;
    }
    return false;
  }, [setActiveAppsInOverview]);
  
  const navigateToBrowser = useCallback(() => {
    setCurrentView('browser');
    let statusText = 'Idle';
    if (browserCurrentUrl) {
        if (browserCurrentUrl.toLowerCase() === 'skulls.system') {
            statusText = skullsSystemUnlocked ? 'skulls.system - Unlocked' : 'skulls.system - Locked';
        } else {
            statusText = `Visiting: ${browserCurrentUrl}`;
        }
    }
    updateActiveApps('browser', 'Web Browser', statusText);
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, browserCurrentUrl, updateActiveApps, skullsSystemUnlocked]);

  const handleSkullsSystemUnlockAttempt = (password: string): boolean => {
    if (password === SKULLS_SYSTEM_PASSWORD) {
      setSkullsSystemUnlocked(true);
      updateActiveApps('browser', 'Web Browser', 'skulls.system - Unlocked');
      return true;
    }
    setSkullsSystemUnlocked(false);
    updateActiveApps('browser', 'Web Browser', 'skulls.system - Locked');
    return false;
  };

  const handleBrowserNavigationRequest = (url: string) => {
    const trimmedUrl = url.trim();
    setBrowserCurrentUrl(trimmedUrl);
    let statusText = 'Idle';
    if (trimmedUrl) {
        if (trimmedUrl.toLowerCase() === 'skulls.system') {
            statusText = skullsSystemUnlocked ? 'skulls.system - Unlocked' : 'skulls.system - Locked';
        } else {
            statusText = `Visiting: ${trimmedUrl}`;
        }
    }
    updateActiveApps('browser', 'Web Browser', statusText);
  };

  const navigateToCalculator = useCallback(() => {
    setCurrentView('calculator');
    updateActiveApps('calculator', 'Calculator', calculatorDisplayValue);
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, calculatorDisplayValue, updateActiveApps]);

  const handleBackNavigation = () => {
    if (isOverviewVisible) {
      setIsOverviewVisible(false);
      return;
    }
    if (currentView === 'chat' || currentView === 'files_locked' || currentView === 'files_unlocked' || currentView === 'browser' || currentView === 'calculator') {
      navigateToHome();
    }
  };

  const sendMessageChatLogic = async (userInput: string) => {
    if (!activeChatTargetId) {
        console.error("sendMessageChatLogic called with no active chat target.");
        setChatError("No chat selected. Please select a conversation.");
        return;
    }

    const currentUserMessage: Message = {
      id: `user-${Date.now()}`,
      sender: Sender.User, 
      text: userInput,
      timestamp: new Date(),
    };

    setChatHistories(prev => ({
      ...prev,
      [activeChatTargetId]: [...prev[activeChatTargetId], currentUserMessage]
    }));
    setLastMessageTimestamps(prev => ({ ...prev, [activeChatTargetId]: currentUserMessage.timestamp.getTime() }));
    setChatError(null);

    if (activeChatTargetId === 'lily') {
      if (!lilyChatSession || !aiInstance || isLilyTyping) {
        if (isLilyTyping) {
            console.warn("Attempted to send message while Lily is typing.");
        }
        return;
      }
      try {
        const genAIResponse = await sendMessageToChat(lilyChatSession, userInput);
        const responseText = genAIResponse.text;

        if (typeof responseText === 'string') {
          await processAndDisplayLilyResponse(responseText);
        } else {
          console.error("Gemini API response did not contain valid text. Full response:", genAIResponse);
          let feedbackMessage = `${LILY_CHAT_SPEAKER_NAME} sent an empty or invalid response.`;

          if (genAIResponse?.candidates?.[0]?.finishReason && genAIResponse.candidates[0].finishReason !== 'STOP') {
             feedbackMessage = `${LILY_CHAT_SPEAKER_NAME}'s response might have been blocked or incomplete. (Reason: ${genAIResponse.candidates[0].finishReason})`;
          } else if (genAIResponse?.promptFeedback?.blockReason) {
             feedbackMessage = `${LILY_CHAT_SPEAKER_NAME}'s response was blocked. (Reason: ${genAIResponse.promptFeedback.blockReason})`;
          }
          
          setChatError(feedbackMessage);
          setChatHistories(prev => ({...prev, lily: [...prev.lily, {
            id: `error-invalid-response-${Date.now()}`, sender: Sender.System, text: feedbackMessage, timestamp: new Date(), isError: true,
          }]}));
          updateActiveApps('chat', 'Messenger', 'Error in chat response');
          setIsLilyTyping(false);
        }
      } catch (error) {
        console.error(`Error sending message to ${LILY_CHAT_SPEAKER_NAME}:`, error);
        setChatHistories(prev => ({...prev, lily: prev.lily.filter(m => !(m.isLoading && m.sender === Sender.Lily && m.text === LILY_TYPING_MESSAGE)) }));
        setIsLilyTyping(false);
        
        const errorText = `${LILY_CHAT_SPEAKER_NAME} seems to be having trouble responding. (Error: ${error instanceof Error ? error.message : String(error)})`;
        setChatError(errorText);
        setChatHistories(prev => ({...prev, lily: [...prev.lily, {
          id: `error-api-call-${Date.now()}`, sender: Sender.System, text: errorText, timestamp: new Date(), isError: true,
        }]}));
        updateActiveApps('chat', 'Messenger', 'Error in chat');
      }
    } else {
      const contact = CHAT_CONTACT_LIST.find(c => c.id === activeChatTargetId);
      const status = contact ? `Messaged ${contact.name}` : 'Message sent';
      updateActiveApps('chat', 'Messenger', status);
    }
  };

  const toggleOverview = () => setIsOverviewVisible(prev => !prev);

  const switchToAppFromOverview = (view: AppView) => {
    if (view === 'chat') navigateToChat(activeChatTargetId || undefined);  // Pass undefined if null
    else if (view === 'files_locked' || view === 'files_unlocked') navigateToFiles(); 
    else if (view === 'browser') navigateToBrowser();
    else if (view === 'calculator') navigateToCalculator();
    setIsOverviewVisible(false);
  };
  
  const handleCloseAppFromOverview = useCallback((viewId: AppView) => {
    setActiveAppsInOverview(prevApps => prevApps.filter(app => app.id !== viewId));

    // Reset state for the closed app
    if (viewId === 'browser') {
      setBrowserCurrentUrl('');
      setSkullsSystemUnlocked(false);
    } else if (viewId === 'calculator') {
      setCalculatorDisplayValue("0");
    } else if (viewId === 'chat') {
      setActiveChatTargetId(null);
      setIsCurrentChatResponsive(false);
      setMessengerFirstOpenedThisSession(false); 
    } else if (viewId === 'files_unlocked' || viewId === 'files_locked') {
      setFilesUnlocked(false);
    }

    // If the closed app was the current view, navigate to home
    if (currentView === viewId) {
      navigateToHome();
    }
  }, [
    currentView, 
    navigateToHome, 
    setBrowserCurrentUrl, 
    setSkullsSystemUnlocked, 
    setCalculatorDisplayValue, 
    setActiveChatTargetId, 
    setIsCurrentChatResponsive, 
    setMessengerFirstOpenedThisSession, 
    setFilesUnlocked
  ]);

  const resetGameState = useCallback(() => {
    setAppStatus('uninitialized');
    setAiInstance(null);
    setIsApiKeyActuallyAvailable(false);
    setChatHistories(initialChatHistoriesState);
    setActiveChatTargetId(null); 
    setIsCurrentChatResponsive(false); 
    setMessengerFirstOpenedThisSession(false); 
    setIsLilyTyping(false);
    setLilyChatSession(null);
    setLilyChatInitialized(false);
    setChatError(null);
    setIsOverviewVisible(false);
    setActiveAppsInOverview([]);
    setBrowserCurrentUrl('');
    setCalculatorDisplayValue("0");
    setFilesUnlocked(false);
    setSkullsSystemUnlocked(false);
    setRelocationEta("Calculating..."); 
    setLastMessageTimestamps({ lily: 0, relocation: 0, subject32: 0, subject33: 0 });
  }, []);

  const requestSignOut = () => {
    setIsSignOutConfirmVisible(true);
  };
  
  const confirmAndProceedSignOut = () => {
    setIsSignOutConfirmVisible(false);
    setIsSigningOut(true);
  
    setTimeout(() => {
      resetGameState();
      setIsSigningOut(false); 
      setCurrentView('credits'); 
    }, 1800); 
  };
  
  const cancelSignOut = () => {
    setIsSignOutConfirmVisible(false);
  };

  const handleCreditsFinished = useCallback(() => {
    setCurrentView('game_start');
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'game_start': return <GameStartScreen onStartGame={proceedToScenarioIntro} />;
      case 'intro': return <IntroScreen onProceed={proceedToSystemInitiating} />;
      case 'system_initiating': return <SystemInitiatingScreen />;
      case 'initial_load': return <InitialLoadingScreen onStartExperience={initializeApi} status={appStatus} />;
      case 'credits': return <CreditsScreen onFinishedDisplaying={handleCreditsFinished} />;
      case 'home':
        return <AndroidHomeScreen
                  onOpenMessenger={() => navigateToChat()} 
                  onOpenFiles={navigateToFiles} 
                  onOpenBrowser={navigateToBrowser}
                  onOpenCalculator={navigateToCalculator} 
                  isApiKeyAvailable={isApiKeyActuallyAvailable}
                />;
      case 'chat':
        return <EscapeRoomChat
                  messages={activeChatTargetId ? chatHistories[activeChatTargetId] : []}
                  isLilyTyping={activeChatTargetId === 'lily' && isLilyTyping}
                  chatError={chatError}
                  onSendMessage={sendMessageChatLogic}
                  isApiKeyAvailable={isApiKeyActuallyAvailable}
                  chatContacts={CHAT_CONTACT_LIST}
                  activeChatTargetId={activeChatTargetId}
                  onSwitchChatTarget={handleSwitchChatTarget}
                  isCurrentChatResponsive={isCurrentChatResponsive}
                  lastMessageTimestamps={lastMessageTimestamps} 
                />;
      case 'files_locked': return <FilesPinScreen onBack={navigateToHome} onPinSuccess={handleFilesUnlock} />; 
      case 'files_unlocked': return <FilesScreen />;
      case 'browser':
        return <BrowserScreen
                  onNavigate={handleBrowserNavigationRequest}
                  currentUrl={browserCurrentUrl}
                  onSkullsSystemUnlockAttempt={handleSkullsSystemUnlockAttempt}
                  isSkullsSystemUnlocked={skullsSystemUnlocked}
                  skullsSystemContentComponent={<SkullsSystemScreen relocationEta={relocationEta} />}
                />;
      case 'calculator': 
        return <CalculatorScreen 
                  initialDisplayValue={calculatorDisplayValue}
                  onDisplayChange={setCalculatorDisplayValue} 
                />;
      default: return <GameStartScreen onStartGame={proceedToScenarioIntro} />;
    }
  };

  const showMacOSTopBar = 
    currentView !== 'game_start' && 
    currentView !== 'intro' && 
    currentView !== 'system_initiating' && 
    currentView !== 'initial_load' &&
    currentView !== 'credits'; 

  const showNavigationControls = 
    currentView !== 'game_start' && 
    currentView !== 'intro' && 
    currentView !== 'system_initiating' && 
    currentView !== 'initial_load' && 
    currentView !== 'credits' && 
    appStatus === 'api_ready';

  const showApiKeyBanner = 
    appStatus === 'api_error' && 
    currentView !== 'game_start' && 
    currentView !== 'intro' && 
    currentView !== 'system_initiating' && 
    currentView !== 'initial_load' &&
    currentView !== 'credits';

  return (
    <div className="h-screen w-screen flex flex-col bg-black">
      {isSigningOut && <SigningOutScreen />}
      
      {!isSigningOut && (
        <>
          {showMacOSTopBar && (
            <MacOSTopBar
              gameName={GAME_NAME}
              onRequestSignOut={requestSignOut}
            />
          )}
          <div className={`flex-grow flex flex-col overflow-hidden ${showMacOSTopBar ? 'pt-7' : ''}`}> 
            {showApiKeyBanner && <ApiKeyBanner />}
            <main className="flex-grow overflow-hidden relative">
              {renderContent()}
              {isOverviewVisible && (
                <OverviewScreen
                  apps={activeAppsInOverview}
                  onSwitchApp={switchToAppFromOverview}
                  onClose={toggleOverview}
                  onCloseApp={handleCloseAppFromOverview}
                />
              )}
            </main>
          </div>
          {showNavigationControls && (
            <NavigationControls
              onHomeClick={navigateToHome}
              onBackClick={handleBackNavigation}
              onOverviewClick={toggleOverview}
              isChatActive={currentView === 'chat'}
              isFilesLockedActive={currentView === 'files_locked'} 
              isFilesUnlockedActive={currentView === 'files_unlocked'} 
              isBrowserActive={currentView === 'browser'}
              isCalculatorActive={currentView === 'calculator'} 
              isOverviewVisible={isOverviewVisible}
            />
          )}
          
          {isSignOutConfirmVisible && (
            <SignOutConfirmationDialog
              isOpen={isSignOutConfirmVisible}
              onConfirm={confirmAndProceedSignOut}
              onCancel={cancelSignOut}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
