
import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
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
import NewGameConfirmationDialog from './components/NewGameConfirmationDialog'; // Added
import SigningOutScreen from './components/SigningOutScreen';
import CreditsScreen from './components/CreditsScreen';
import {
    API_KEY_ERROR_MESSAGE, SYSTEM_INSTRUCTION, LILY_TYPING_MESSAGE,
    IMAGE_GENERATION_ERROR_MESSAGE, RELOCATION_UNIT_CHAT_HISTORY,
    CHAT_CONTACT_LIST, LILY_CHAT_SPEAKER_NAME, GALLERY_PIN,
    SKULLS_SYSTEM_PASSWORD, CHUTE_KEYPAD_SEQUENCE, NO_CHAT_SELECTED_DISPLAY_NAME,
    SUBJECT_34_PROFILE_NAME
} from './constants';
import { Message, Sender, ChatTargetId, ChatContact, View as AppView, ChatTargetIdOrNull, BrowserContentView } from './types';
import { initChatSession, sendMessageToChat, serializeChatHistory, deserializeChatHistoryTimestamps, serializeTimestamps, deserializeTimestamps, convertMessagesToGeminiHistory } from './services/geminiService';

type AppStatus = 'uninitialized' | 'initializing_api' | 'api_ready' | 'api_error';

export interface OverviewApp {
  id: AppView;
  title: string;
  status: string;
}

const LOCAL_STORAGE_STATE_KEY = 'terminalEchoesGameState_v1';

const initialChatHistoriesState: Record<ChatTargetId, Message[]> = {
  lily: [],
  relocation: [],
  subject32: [],
  subject33: [],
};

const initialUnreadCounts: Record<ChatTargetId, number> = {
  lily: 0,
  relocation: 0,
  subject32: 0,
  subject33: 0,
};

export interface AppNotification {
  message: string;
  key: number; // For re-triggering animations
  chatTargetId?: ChatTargetId; // Optional: to specify which chat to open
}

const LILY_IDLE_CHECK_IN_MESSAGES = [
  "Are you still there?",
  "Hello...?",
  "Everything okay?",
  "Just checking in...",
  "Did you manage to find anything new?",
  "Any luck?",
  "I'm still here, waiting.",
  "Please tell me you're still trying to help.",
];

const MAX_BROWSER_HISTORY_LENGTH = 50;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('game_start');
  const [appStatus, setAppStatus] = useState<AppStatus>('uninitialized');
  const [aiInstance, setAiInstance] = useState<GoogleGenAI | null>(null);
  const [isApiKeyActuallyAvailable, setIsApiKeyActuallyAvailable] = useState<boolean>(false);

  const [chatHistories, setChatHistories] = useState<Record<ChatTargetId, Message[]>>(initialChatHistoriesState);
  const [activeChatTargetId, setActiveChatTargetId] = useState<ChatTargetIdOrNull>(null);
  const activeChatTargetIdRef = useRef<ChatTargetIdOrNull>(null);
  const [lastOpenedChat, setLastOpenedChat] = useState<ChatTargetIdOrNull>(null);

  const [isCurrentChatResponsive, setIsCurrentChatResponsive] = useState<boolean>(false);
  const [isLilyTyping, setIsLilyTyping] = useState<boolean>(false);
  const [lilyChatSession, setLilyChatSession] = useState<Chat | null>(null);
  const [lilyChatInitialized, setLilyChatInitialized] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isLilyTrusting, setIsLilyTrusting] = useState<boolean>(false);
  const lilyIdleTimerRef = useRef<number | null>(null);

  const [isOverviewVisible, setIsOverviewVisible] = useState<boolean>(false);
  const [activeAppsInOverview, setActiveAppsInOverview] = useState<OverviewApp[]>([]);

  const [browserCurrentUrl, setBrowserCurrentUrl] = useState<string>('');
  const [browserHistory, setBrowserHistory] = useState<string[]>([]);
  const [browserBookmarks, setBrowserBookmarks] = useState<string[]>(['skulls.system']);
  const [browserContentView, setBrowserContentView] = useState<BrowserContentView>('page');

  const [calculatorDisplayValue, setCalculatorDisplayValue] = useState<string>("0");

  const [filesUnlocked, setFilesUnlocked] = useState<boolean>(false);
  const [skullsSystemUnlocked, setSkullsSystemUnlocked] = useState<boolean>(false);
  const [relocationEta, setRelocationEta] = useState<string>("Calculating...");

  const [isSignOutConfirmVisible, setIsSignOutConfirmVisible] = useState<boolean>(false);
  const [isNewGameConfirmVisible, setIsNewGameConfirmVisible] = useState<boolean>(false); // Added
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const [lastMessageTimestamps, setLastMessageTimestamps] = useState<Record<ChatTargetId, number>>({
    lily: 0,
    relocation: 0,
    subject32: 0,
    subject33: 0,
  });

  const [messengerFirstOpenedThisSession, setMessengerFirstOpenedThisSession] = useState<boolean>(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<ChatTargetId, number>>(initialUnreadCounts);

  const [notificationQueue, setNotificationQueue] = useState<AppNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<AppNotification | null>(null);
  const notificationDismissTimerRef = useRef<number | null>(null);

  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);


  const MIN_TYPING_DELAY = 700;
  const MAX_TYPING_DELAY = 4000;
  const TYPING_DELAY_PER_CHAR = 40;

  useEffect(() => {
    if (currentView === 'game_start') { 
      const savedStateString = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
      setHasSavedGame(!!savedStateString);
    }
  }, [currentView]);

  const displayNotification = useCallback((msgText: string, senderName?: string, targetChatId?: ChatTargetId) => {
    const fullMessage = senderName ? `${senderName}: ${msgText}` : msgText;
    const truncatedMessage = fullMessage.length > 60 ? `${fullMessage.substring(0, 57)}...` : fullMessage;

    const newNotification: AppNotification = {
      message: truncatedMessage,
      key: Date.now(),
      chatTargetId: targetChatId
    };

    setNotificationQueue(prevQueue => [...prevQueue, newNotification]);
  }, []);

  useEffect(() => {
    if (currentNotification) {
      const timerId = window.setTimeout(() => {
        setCurrentNotification(null);
      }, 5000); // Notification display time
      notificationDismissTimerRef.current = timerId;
      return () => clearTimeout(timerId);
    } else if (notificationQueue.length > 0) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setNotificationQueue(prevQueue => prevQueue.slice(1));
    }
  }, [currentNotification, notificationQueue]);

  useEffect(() => {
    return () => {
      if (notificationDismissTimerRef.current) {
        clearTimeout(notificationDismissTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    activeChatTargetIdRef.current = activeChatTargetId;
  }, [activeChatTargetId]);

  useEffect(() => {
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

  const resetGameState = useCallback(() => {
    setAppStatus('uninitialized');
    setAiInstance(null);
    setIsApiKeyActuallyAvailable(false);
    setChatHistories(initialChatHistoriesState);
    setActiveChatTargetId(null);
    setLastOpenedChat(null);
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
    setUnreadCounts(initialUnreadCounts);
    setCurrentNotification(null);
    setNotificationQueue([]);
    if (notificationDismissTimerRef.current) {
      clearTimeout(notificationDismissTimerRef.current);
      notificationDismissTimerRef.current = null;
    }
    setIsLilyTrusting(false);
    if (lilyIdleTimerRef.current) {
      clearTimeout(lilyIdleTimerRef.current);
      lilyIdleTimerRef.current = null;
    }
    setBrowserHistory([]);
    setBrowserBookmarks(['skulls.system']);
    setBrowserContentView('page');
    localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
    setHasSavedGame(false);
    setIsStateLoaded(false); 
  }, []);

  const handleNewGame = useCallback(() => {
    if (hasSavedGame) {
      setIsNewGameConfirmVisible(true);
    } else {
      resetGameState();
      proceedToScenarioIntro();
    }
  }, [hasSavedGame, resetGameState, proceedToScenarioIntro]);
  
  const confirmAndStartNewGame = useCallback(() => {
    setIsNewGameConfirmVisible(false);
    resetGameState();
    proceedToScenarioIntro();
  }, [resetGameState, proceedToScenarioIntro]);

  const cancelNewGameConfirmation = useCallback(() => {
    setIsNewGameConfirmVisible(false);
  }, []);
  
  const handleLoadGame = useCallback(() => {
    setCurrentView('initial_load');
  }, []);

  const initializeApi = useCallback(() => {
    setAppStatus('initializing_api');
    const key = process.env.API_KEY; 
    if (key) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        setAiInstance(ai);
        setIsApiKeyActuallyAvailable(true);
        setAppStatus('api_ready');
        if (!isStateLoaded || currentView === 'initial_load') {
             setCurrentView('home');
        }
      } catch (error) {
        console.error("Error initializing GoogleGenAI:", error);
        setAppStatus('api_error');
        setIsApiKeyActuallyAvailable(false);
      }
    } else {
      setAppStatus('api_error');
      setIsApiKeyActuallyAvailable(false);
    }
  }, [isStateLoaded, currentView]);

  const initializeAllChats = useCallback(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const formattedNextHourTime = nextHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRelocationEta(formattedNextHourTime);

    let relocationLastTimestamp = 0;
    let relocationUnreadCount = 0;
    const relocationHistoryWithTimestampsAndSeen = RELOCATION_UNIT_CHAT_HISTORY.map(msg => {
      let updatedText = msg.text;
      if (updatedText?.includes('[DYNAMIC_NEXT_HOUR_TIME]')) {
        updatedText = updatedText.replace('[DYNAMIC_NEXT_HOUR_TIME]', formattedNextHourTime);
      }
      const timestampDate = new Date(msg.timestamp);
      if (timestampDate.getTime() > relocationLastTimestamp) {
          relocationLastTimestamp = timestampDate.getTime();
      }
      const isSeen = activeChatTargetIdRef.current === 'relocation';
      if (!isSeen && msg.sender !== Sender.User) {
          relocationUnreadCount++;
      }
      return { ...msg, text: updatedText, timestamp: timestampDate, isSeen };
    });

    setChatHistories(prev => ({
      ...prev, 
      lily: initialChatHistoriesState.lily, 
      relocation: relocationHistoryWithTimestampsAndSeen,
      subject32: initialChatHistoriesState.subject32, 
      subject33: initialChatHistoriesState.subject33, 
    }));

    setLastMessageTimestamps(prev => ({...prev, relocation: relocationLastTimestamp || Date.now()}));
    setUnreadCounts(prev => ({ ...prev, relocation: relocationUnreadCount }));

  }, [activeChatTargetIdRef]); 

  // LOAD GAME STATE
  useEffect(() => {
    if (appStatus === 'api_ready' && aiInstance && !isStateLoaded) {
      const savedStateString = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
      let successfullyLoaded = false;

      if (savedStateString) {
        try {
          const loadedState = JSON.parse(savedStateString);

          if (loadedState.currentView && (currentView === 'initial_load' || currentView === 'home')) {
            setCurrentView(loadedState.currentView);
          }
          
          let loadedLilyHistory: Message[] = [];
          if (loadedState.chatHistories) {
            const deserialized = deserializeChatHistoryTimestamps(loadedState.chatHistories);
            setChatHistories(deserialized); 
            loadedLilyHistory = deserialized.lily || []; 
          } else {
            initializeAllChats(); 
            loadedLilyHistory = [];
          }
          
          if (loadedState.activeChatTargetId) setActiveChatTargetId(loadedState.activeChatTargetId);
          if (loadedState.lastOpenedChat) setLastOpenedChat(loadedState.lastOpenedChat);
          
          if (loadedState.lilyChatInitialized !== undefined) setLilyChatInitialized(loadedState.lilyChatInitialized);


          if (loadedState.isLilyTrusting) setIsLilyTrusting(loadedState.isLilyTrusting);
          if (loadedState.activeAppsInOverview) setActiveAppsInOverview(loadedState.activeAppsInOverview);
          if (loadedState.browserCurrentUrl) setBrowserCurrentUrl(loadedState.browserCurrentUrl);
          if (loadedState.browserHistory) setBrowserHistory(loadedState.browserHistory);
          if (loadedState.browserBookmarks) setBrowserBookmarks(loadedState.browserBookmarks);
          if (loadedState.browserContentView) setBrowserContentView(loadedState.browserContentView);
          if (loadedState.calculatorDisplayValue) setCalculatorDisplayValue(loadedState.calculatorDisplayValue);
          if (loadedState.filesUnlocked) setFilesUnlocked(loadedState.filesUnlocked);
          if (loadedState.skullsSystemUnlocked) setSkullsSystemUnlocked(loadedState.skullsSystemUnlocked);
          if (loadedState.relocationEta) setRelocationEta(loadedState.relocationEta);
          if (loadedState.lastMessageTimestamps) setLastMessageTimestamps(deserializeTimestamps(loadedState.lastMessageTimestamps));
          if (loadedState.messengerFirstOpenedThisSession) setMessengerFirstOpenedThisSession(loadedState.messengerFirstOpenedThisSession);
          if (loadedState.unreadCounts) setUnreadCounts(loadedState.unreadCounts);

          if (aiInstance) { 
            const shouldReInitLilyChat = loadedState.lilyChatInitialized || loadedLilyHistory.length > 0;
            
            if (shouldReInitLilyChat) {
              try {
                  const geminiHistory = convertMessagesToGeminiHistory(loadedLilyHistory);
                  console.log("LOAD_EFFECT: Re-initializing Lily chat with history. Parts:", geminiHistory.length);
                  const newChat = initChatSession(aiInstance, SYSTEM_INSTRUCTION, geminiHistory);
                  setLilyChatSession(newChat);
                  setLilyChatInitialized(true); 
              } catch (error) {
                  console.error("Error re-initializing Lily chat session from saved state:", error);
                  setChatError(`Error restoring ${SUBJECT_34_PROFILE_NAME} session.`);
                  setLilyChatInitialized(false); 
              }
            }
          }
          successfullyLoaded = true;
          console.log("Game state loaded from localStorage.");
        } catch (error) {
          console.error("Failed to parse or apply saved game state:", error);
          localStorage.removeItem(LOCAL_STORAGE_STATE_KEY);
          setHasSavedGame(false); 
          initializeAllChats(); 
        }
      }
      if (!successfullyLoaded) { 
        initializeAllChats(); 
        if (currentView === 'initial_load') { 
          setCurrentView('home');
        }
      }
      setIsStateLoaded(true); 
    }
  }, [appStatus, aiInstance, isStateLoaded, initializeAllChats, SYSTEM_INSTRUCTION, SUBJECT_34_PROFILE_NAME, currentView]);


  const parseGeminiResponse = useCallback((responseText: string): { segments: Array<{ type: 'text'; content: string } | { type: 'image_prompt'; content: string }> } => {
    const finalSegments: Array<{ type: 'text'; content: string } | { type: 'image_prompt'; content: string }> = [];
    const partBreakSegments = responseText.split('||PART_BREAK||');
    const imagePromptRegex = /\[IMAGE_PROMPT:\s*(.*?)\]/s;

    const addTextSegments = (text: string) => {
        if (text.trim()) {
            const lines = text.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    finalSegments.push({ type: 'text', content: trimmedLine });
                }
            }
        }
    };

    for (const part of partBreakSegments) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        const imageMatch = trimmedPart.match(imagePromptRegex);

        if (imageMatch && imageMatch[1]) {
            const textBefore = trimmedPart.substring(0, imageMatch.index);
            addTextSegments(textBefore);
            finalSegments.push({ type: 'image_prompt', content: imageMatch[1].trim() });
            const textAfter = trimmedPart.substring(imageMatch.index + imageMatch[0].length);
            addTextSegments(textAfter);
        } else {
            addTextSegments(trimmedPart);
        }
    }
    return { segments: finalSegments };
  }, []);

  const processAndDisplayLilyResponse = useCallback(async (responseText: string, initialCall: boolean = false) => {
    if (!isLilyTrusting) {
      const trustKeywords = [
        "i can't believe it", "he's really not coming back",
        "get me out of here", "i'll do anything", "tell me what to do",
        "you're sure?", "you're really here to help"
      ];
      const lowerResponseText = responseText.toLowerCase();
      if (trustKeywords.some(keyword => lowerResponseText.includes(keyword))) {
        setIsLilyTrusting(true);
      }
    }

    const { segments } = parseGeminiResponse(responseText);
    let typingMessageId = `lily-typing-${Date.now()}`;
    const currentActiveChat = activeChatTargetIdRef.current;
    const messageIsSeen = currentActiveChat === 'lily';

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
          isSeen: true,
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
            if(segment.content.trim()){
                addTypingIndicator();
                await new Promise(resolve => setTimeout(resolve, calculateTypingDelay(segment.content.length)));
                removeTypingIndicator();

                const newLilyMessage: Message = {
                    id: `lily-${Date.now()}-${i}`,
                    sender: Sender.Lily,
                    text: segment.content,
                    timestamp: new Date(),
                    isSeen: messageIsSeen,
                };
                setChatHistories(prev => {
                    const updatedLilyHistory = [...prev.lily, newLilyMessage];
                    if (!initialCall) {
                        const lilyTextMessagesCount = updatedLilyHistory.filter(m => m.sender === Sender.Lily && m.text && !m.isLoading).length;
                        updateActiveApps('chat', 'Messenger', `${lilyTextMessagesCount} messages from ${LILY_CHAT_SPEAKER_NAME}`);
                    }
                    return {...prev, lily: updatedLilyHistory};
                });
                if (!messageIsSeen) {
                  setUnreadCounts(prevUnread => ({ ...prevUnread, lily: (prevUnread.lily || 0) + 1 }));
                  displayNotification(segment.content, SUBJECT_34_PROFILE_NAME, 'lily');
                }
                setLastMessageTimestamps(prev => ({ ...prev, lily: newLilyMessage.timestamp.getTime() }));
            }
        } else if (segment.type === 'image_prompt') {
            if (!aiInstance) {
                 const errorMsg: Message = { id: `lily-img-error-no-ai-${Date.now()}`, sender: Sender.Lily, text: IMAGE_GENERATION_ERROR_MESSAGE, isLoading: false, isError: true, timestamp: new Date(), isSeen: messageIsSeen };
                 setChatHistories(prev => ({...prev, lily: [...prev.lily, errorMsg]}));
                 if (!messageIsSeen) {
                    setUnreadCounts(prevUnread => ({ ...prevUnread, lily: (prevUnread.lily || 0) + 1 }));
                    displayNotification(IMAGE_GENERATION_ERROR_MESSAGE, SUBJECT_34_PROFILE_NAME, 'lily');
                 }
                 continue;
            }
            const imageMessageId = `img-${Date.now()}-${i}`;
            const imageTimestamp = new Date();
            const initialImageMessage: Message = {
                id: imageMessageId,
                sender: Sender.Lily,
                isLoading: true,
                timestamp: imageTimestamp,
                isSeen: messageIsSeen,
            };
            setChatHistories(prev => ({...prev, lily: [...prev.lily, initialImageMessage]}));
            if (!messageIsSeen) {
                setUnreadCounts(prevUnread => ({ ...prevUnread, lily: (prevUnread.lily || 0) + 1 }));
                displayNotification("Sent an image", SUBJECT_34_PROFILE_NAME, 'lily');
            }

            if (!initialCall) updateActiveApps('chat', 'Messenger', `${SUBJECT_34_PROFILE_NAME} is sending an image...`);
            try {
                const response = await aiInstance.models.generateImages({
                    model: 'imagen-3.0-generate-002',
                    prompt: segment.content,
                    config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
                });
                const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
                const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

                setChatHistories(prev => {
                    const updatedHistory = prev.lily.map(msg =>
                        msg.id === imageMessageId ? { ...msg, imageUrl, isLoading: false } : msg
                    );
                    if (!initialCall && i === segments.length - 1) {
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
                    msg.id === imageMessageId ? { ...msg, id: `lily-img-error-${Date.now()}`, text: IMAGE_GENERATION_ERROR_MESSAGE, isLoading: false, isError: true, timestamp: new Date() } : msg
                )}));
            }
        }
        if (i < segments.length - 1 && segments[i+1].type === 'text' && segments[i+1].content.trim()) {
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
        }
    }
    setIsLilyTyping(false);
  }, [aiInstance, parseGeminiResponse, updateActiveApps, calculateTypingDelay, displayNotification, isLilyTrusting, setIsLilyTrusting, LILY_CHAT_SPEAKER_NAME, SUBJECT_34_PROFILE_NAME, activeChatTargetIdRef]);

  const initializeLilyChat = useCallback(async () => {
    if (!aiInstance) {
      setChatError("AI Service not initialized.");
      const errorMsg: Message = { id: `init-error-no-ai-${Date.now()}`, sender: Sender.System, text: "AI Service not initialized.", timestamp: new Date(), isError: true, isSeen: activeChatTargetIdRef.current === 'lily' };
      setChatHistories(prev => ({...prev, lily: [...prev.lily, errorMsg]}));
      if(activeChatTargetIdRef.current !== 'lily') {
        setUnreadCounts(prev => ({ ...prev, lily: (prev.lily || 0) + 1 }));
        displayNotification("AI Service not initialized.", undefined, 'lily');
      }
      updateActiveApps('chat', 'Messenger', 'Error: AI Offline');
      setLilyChatInitialized(false);
      return;
    }
    
    setChatError(null);
    updateActiveApps('chat', 'Messenger', `Chat with ${SUBJECT_34_PROFILE_NAME}`);

    try {
      const currentLilyMessages = chatHistories.lily || [];
      const geminiHistory = convertMessagesToGeminiHistory(currentLilyMessages);
      console.log("initializeLilyChat: Initializing/Re-initializing with history. Parts:", geminiHistory.length);
      
      const newChat = initChatSession(aiInstance, SYSTEM_INSTRUCTION, geminiHistory);
      setLilyChatSession(newChat);
      setLilyChatInitialized(true); 
    } catch (error) {
      console.error("Error initializing Lily chat session:", error);
      const errorText = `Error starting ${SUBJECT_34_PROFILE_NAME} session: ${error instanceof Error ? error.message : String(error)}`;
      setChatError(errorText);
      const currentActiveChat = activeChatTargetIdRef.current;
      const errorMsgIsSeen = currentActiveChat === 'lily';
      const errorMsg: Message = { id: `init-error-${Date.now()}`, sender: Sender.System, text: errorText, timestamp: new Date(), isError: true, isSeen: errorMsgIsSeen };
      setChatHistories(prev => ({...prev, lily: [...prev.lily, errorMsg]}));
      if(!errorMsgIsSeen) {
        setUnreadCounts(prev => ({ ...prev, lily: (prev.lily || 0) + 1 }));
        displayNotification(errorText, undefined, 'lily');
      }
      setLilyChatInitialized(false);
      updateActiveApps('chat', 'Messenger', 'Error starting chat');
    }
  }, [aiInstance, chatHistories, updateActiveApps, displayNotification, SYSTEM_INSTRUCTION, SUBJECT_34_PROFILE_NAME, activeChatTargetIdRef]);

  const handleSwitchChatTarget = useCallback(async (targetId: ChatTargetIdOrNull) => {
    setActiveChatTargetId(targetId);

    if (targetId === null) {
      setIsCurrentChatResponsive(false);
      updateActiveApps('chat', 'Messenger', 'Select a conversation');
      return;
    }

    setLastOpenedChat(targetId);
    const contact = CHAT_CONTACT_LIST.find(c => c.id === targetId);
    setIsCurrentChatResponsive(contact ? contact.isResponsive : false);

    if (targetId === 'lily' && appStatus === 'api_ready' && aiInstance) {
      if (!lilyChatSession || !lilyChatInitialized) { 
          await initializeLilyChat();
      }
    }

    setChatHistories(prevHistories => {
      const currentChatMessages = prevHistories[targetId];
      if (!currentChatMessages) return prevHistories;

      const updatedMessages = currentChatMessages.map(msg =>
        msg.sender !== Sender.User && !msg.isSeen ? { ...msg, isSeen: true } : msg
      );
      return { ...prevHistories, [targetId]: updatedMessages };
    });
    setUnreadCounts(prevUnread => ({ ...prevUnread, [targetId]: 0 }));

    const contactForStatus = CHAT_CONTACT_LIST.find(c => c.id === targetId);
    const status = contactForStatus
      ? (targetId === 'lily' ? `Chat with ${SUBJECT_34_PROFILE_NAME}` : contactForStatus.name)
      : NO_CHAT_SELECTED_DISPLAY_NAME;
    updateActiveApps('chat', 'Messenger', status);

  }, [appStatus, aiInstance, initializeLilyChat, updateActiveApps, lilyChatSession, lilyChatInitialized, SUBJECT_34_PROFILE_NAME]);

  const navigateToChat = useCallback((targetId?: ChatTargetIdOrNull) => {
    if (appStatus !== 'api_ready') {
      setCurrentView('home');
      setActiveChatTargetId(null);
      return;
    }
    if (isOverviewVisible) setIsOverviewVisible(false);

    if (!messengerFirstOpenedThisSession) {
      setCurrentView('chat');
      setMessengerFirstOpenedThisSession(true);
      handleSwitchChatTarget(null);
    } else {
      setCurrentView('chat');
      if (targetId !== undefined) {
          handleSwitchChatTarget(targetId);
      } else {
          handleSwitchChatTarget(lastOpenedChat || null);
      }
    }
  }, [appStatus, isOverviewVisible, handleSwitchChatTarget, messengerFirstOpenedThisSession, lastOpenedChat]);


  useEffect(() => {
    if (currentView === 'chat' && activeChatTargetId === 'lily' && appStatus === 'api_ready' && aiInstance) {
      if (!lilyChatSession || !lilyChatInitialized) { 
         console.log("VIEW_EFFECT: Calling initializeLilyChat. Session exists?", !!lilyChatSession, "Initialized?", lilyChatInitialized);
         initializeLilyChat();
      }
    }
  }, [currentView, activeChatTargetId, appStatus, aiInstance, initializeLilyChat, lilyChatSession, lilyChatInitialized]);

  const navigateToHome = useCallback(() => {
    if (isOverviewVisible) setIsOverviewVisible(false);
    setCurrentView('home');
    setActiveChatTargetId(null);
  }, [isOverviewVisible]);

  const navigateToFiles = useCallback(() => {
    if (filesUnlocked) {
        setCurrentView('files_unlocked');
        updateActiveApps('files_unlocked', 'Files', 'Contents Unlocked');
    } else {
        setCurrentView('files_locked');
        updateActiveApps('files_locked', 'Files', 'PIN Required');
    }
    setActiveChatTargetId(null);
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
  }, []);

  const getBrowserAppStatus = useCallback(() => {
    switch (browserContentView) {
      case 'history':
        return 'Viewing History';
      case 'bookmarks':
        return 'Viewing Bookmarks';
      case 'page':
      default:
        if (browserCurrentUrl) {
          if (browserCurrentUrl.toLowerCase() === 'skulls.system') {
            return skullsSystemUnlocked ? 'skulls.system - Unlocked' : 'skulls.system - Locked';
          }
          return `Visiting: ${browserCurrentUrl.length > 20 ? browserCurrentUrl.substring(0, 17) + '...' : browserCurrentUrl}`;
        }
        return 'Idle';
    }
  }, [browserContentView, browserCurrentUrl, skullsSystemUnlocked]);

  const navigateToBrowser = useCallback(() => {
    setCurrentView('browser');
    updateActiveApps('browser', 'Web Browser', getBrowserAppStatus());
    setActiveChatTargetId(null);
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, updateActiveApps, getBrowserAppStatus]);

  useEffect(() => {
    if (currentView === 'browser') {
      updateActiveApps('browser', 'Web Browser', getBrowserAppStatus());
    }
  }, [currentView, browserContentView, browserCurrentUrl, skullsSystemUnlocked, updateActiveApps, getBrowserAppStatus]);


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
    setBrowserContentView('page'); 

    if (trimmedUrl && trimmedUrl.toLowerCase() !== 'skulls.system') {
        setBrowserHistory(prev => {
            const newHistory = [trimmedUrl, ...prev.filter(item => item !== trimmedUrl)];
            return newHistory.slice(0, MAX_BROWSER_HISTORY_LENGTH);
        });
    }
    updateActiveApps('browser', 'Web Browser', getBrowserAppStatus());
  };

  const addBrowserBookmark = useCallback((urlToAdd: string) => {
    if (!urlToAdd || urlToAdd.toLowerCase() === 'skulls.system') return;

    setBrowserBookmarks(prevBookmarks => {
        if (prevBookmarks.includes(urlToAdd)) {
            return prevBookmarks;
        }
        const otherBookmarks = prevBookmarks.filter(bm => bm.toLowerCase() !== 'skulls.system');
        const updatedOtherBookmarks = [...otherBookmarks, urlToAdd].sort();
        return ['skulls.system', ...updatedOtherBookmarks];
    });
  }, []);

  const removeBrowserBookmark = useCallback((urlToRemove: string) => {
      if (!urlToRemove || urlToRemove.toLowerCase() === 'skulls.system') return;

      setBrowserBookmarks(prevBookmarks => prevBookmarks.filter(bm => bm !== urlToRemove));
  }, []);

  const isUrlBookmarked = useCallback((url: string) => {
      return browserBookmarks.includes(url);
  }, [browserBookmarks]);

  const handleToggleBookmark = useCallback((url: string) => {
    if (!url) return;
    if (url.toLowerCase() === 'skulls.system') {
      return;
    }

    if (isUrlBookmarked(url)) {
      removeBrowserBookmark(url);
    } else {
      addBrowserBookmark(url);
    }
  }, [isUrlBookmarked, addBrowserBookmark, removeBrowserBookmark]);


  const navigateToCalculator = useCallback(() => {
    setCurrentView('calculator');
    updateActiveApps('calculator', 'Calculator', calculatorDisplayValue);
    setActiveChatTargetId(null);
    if (isOverviewVisible) setIsOverviewVisible(false);
  }, [isOverviewVisible, calculatorDisplayValue, updateActiveApps]);

  const handleBackNavigation = () => {
    if (isOverviewVisible) {
      setIsOverviewVisible(false);
      return;
    }

    const isMobileScreen = window.innerWidth < 640;

    if (currentView === 'chat' && isMobileScreen && activeChatTargetId !== null) {
      handleSwitchChatTarget(null);
    } else if (currentView === 'browser' && browserContentView !== 'page') {
        setBrowserContentView('page'); 
    } else if (currentView !== 'home' && currentView !== 'initial_load' && currentView !== 'system_initiating' && currentView !== 'intro' && currentView !== 'game_start') { // Prevent going "back" from home to init screens
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
      isSeen: true,
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
          let feedbackMessage = `${SUBJECT_34_PROFILE_NAME} sent an empty or invalid response.`;

          if (genAIResponse?.candidates?.[0]?.finishReason && genAIResponse.candidates[0].finishReason !== 'STOP') {
             feedbackMessage = `${SUBJECT_34_PROFILE_NAME}'s response might have been blocked or incomplete. (Reason: ${genAIResponse.candidates[0].finishReason})`;
          } else if (genAIResponse?.promptFeedback?.blockReason) {
             feedbackMessage = `${SUBJECT_34_PROFILE_NAME}'s response was blocked. (Reason: ${genAIResponse.promptFeedback.blockReason})`;
          }

          setChatError(feedbackMessage);
          const currentActiveChat = activeChatTargetIdRef.current;
          const errorSysMsg: Message = {
            id: `error-invalid-response-${Date.now()}`, sender: Sender.System, text: feedbackMessage, timestamp: new Date(), isError: true, isSeen: currentActiveChat === 'lily'
          };
          setChatHistories(prev => ({...prev, lily: [...prev.lily, errorSysMsg]}));
           if (currentActiveChat !== 'lily') {
            setUnreadCounts(prevUnread => ({ ...prevUnread, lily: (prevUnread.lily || 0) + 1 }));
            displayNotification(feedbackMessage, undefined, 'lily');
          }
          updateActiveApps('chat', 'Messenger', 'Error in chat response');
          setIsLilyTyping(false);
        }
      } catch (error) {
        console.error(`Error sending message to ${SUBJECT_34_PROFILE_NAME}:`, error);
        setChatHistories(prev => ({...prev, lily: prev.lily.filter(m => !(m.isLoading && m.sender === Sender.Lily && m.text === LILY_TYPING_MESSAGE)) }));
        setIsLilyTyping(false);

        const errorText = `${SUBJECT_34_PROFILE_NAME} seems to be having trouble responding. (Error: ${error instanceof Error ? error.message : String(error)})`;
        setChatError(errorText);
        const currentActiveChat = activeChatTargetIdRef.current;
        const errorApiMsg: Message = {
          id: `error-api-call-${Date.now()}`, sender: Sender.System, text: errorText, timestamp: new Date(), isError: true, isSeen: currentActiveChat === 'lily'
        };
        setChatHistories(prev => ({...prev, lily: [...prev.lily, errorApiMsg]}));
        if (currentActiveChat !== 'lily') {
            setUnreadCounts(prevUnread => ({ ...prevUnread, lily: (prevUnread.lily || 0) + 1 }));
            displayNotification(errorText, undefined, 'lily');
        }
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
    if (view === 'chat') navigateToChat(activeChatTargetId);
    else if (view === 'files_locked' || view === 'files_unlocked') navigateToFiles();
    else if (view === 'browser') navigateToBrowser();
    else if (view === 'calculator') navigateToCalculator();
    setIsOverviewVisible(false);
  };

  const handleCloseAppFromOverview = useCallback((viewId: AppView) => {
    setActiveAppsInOverview(prevApps => prevApps.filter(app => app.id !== viewId));

    if (viewId === 'browser') {
      setBrowserCurrentUrl('');
      setSkullsSystemUnlocked(false);
      setBrowserHistory([]);
      setBrowserContentView('page');
    } else if (viewId === 'calculator') {
      setCalculatorDisplayValue("0");
    } else if (viewId === 'chat') {
      setMessengerFirstOpenedThisSession(false);
      setLastOpenedChat(null);
      if (currentView === 'chat') {
         setActiveChatTargetId(null);
      }
    } else if (viewId === 'files_unlocked' || viewId === 'files_locked') {
      setFilesUnlocked(false);
    }

    if (currentView === viewId) {
      setCurrentView('home');
    }
  }, [currentView]);


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

  const handleNotificationClick = useCallback(() => {
    const targetChat = currentNotification?.chatTargetId || null;
    navigateToChat(targetChat);

    if (notificationDismissTimerRef.current) {
      clearTimeout(notificationDismissTimerRef.current);
      notificationDismissTimerRef.current = null;
    }
    setCurrentNotification(null);
  }, [currentNotification, navigateToChat]);

  const sendLilyIdleCheckInMessage = useCallback(() => {
    const randomMessageText = LILY_IDLE_CHECK_IN_MESSAGES[Math.floor(Math.random() * LILY_IDLE_CHECK_IN_MESSAGES.length)];
    const currentActiveChat = activeChatTargetIdRef.current;
    const messageIsSeen = currentActiveChat === 'lily';

    const newMessage: Message = {
      id: `lily-idle-${Date.now()}`,
      sender: Sender.Lily,
      text: randomMessageText,
      timestamp: new Date(),
      isSeen: messageIsSeen,
      isLoading: false,
    };

    setChatHistories(prev => ({
      ...prev,
      lily: [...prev.lily, newMessage],
    }));
    setLastMessageTimestamps(prev => ({ ...prev, lily: newMessage.timestamp.getTime() }));

    if (!messageIsSeen) {
      setUnreadCounts(prevUnread => ({ ...prevUnread, lily: (prevUnread.lily || 0) + 1 }));
      displayNotification(randomMessageText, SUBJECT_34_PROFILE_NAME, 'lily');
    }
  }, [displayNotification, activeChatTargetIdRef, SUBJECT_34_PROFILE_NAME]);

  useEffect(() => {
    if (lilyIdleTimerRef.current) {
      clearTimeout(lilyIdleTimerRef.current);
      lilyIdleTimerRef.current = null;
    }

    if (isLilyTrusting && appStatus === 'api_ready' && !isLilyTyping) {
      const minDelay = 2 * 60 * 1000;
      const maxDelay = 5 * 60 * 1000;

      const lastInteractionTime = lastMessageTimestamps.lily || 0;
      const now = Date.now();
      let timeToWait;

      if (lastInteractionTime === 0 && isLilyTrusting) {
        timeToWait = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      } else if (lastInteractionTime > 0) {
        const idealNextCheckInTime = lastInteractionTime + (Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay);
        timeToWait = idealNextCheckInTime - now;
      } else {
        timeToWait = -1; 
      }

      if (timeToWait > 0) {
        lilyIdleTimerRef.current = window.setTimeout(() => {
          if (isLilyTrusting && appStatus === 'api_ready' && !isLilyTyping) {
            sendLilyIdleCheckInMessage();
          }
        }, timeToWait);
      }
    }

    return () => {
      if (lilyIdleTimerRef.current) {
        clearTimeout(lilyIdleTimerRef.current);
        lilyIdleTimerRef.current = null;
      }
    };
  }, [
    isLilyTrusting,
    appStatus,
    isLilyTyping,
    lastMessageTimestamps.lily,
    sendLilyIdleCheckInMessage,
  ]);

  // SAVE GAME STATE
  useEffect(() => {
    if (appStatus === 'api_ready' && isStateLoaded) {
      const gameState = {
        currentView,
        chatHistories: serializeChatHistory(chatHistories),
        activeChatTargetId,
        lastOpenedChat,
        lilyChatInitialized,
        isLilyTrusting,
        activeAppsInOverview,
        browserCurrentUrl,
        browserHistory,
        browserBookmarks,
        browserContentView,
        calculatorDisplayValue,
        filesUnlocked,
        skullsSystemUnlocked,
        relocationEta,
        lastMessageTimestamps: serializeTimestamps(lastMessageTimestamps),
        messengerFirstOpenedThisSession,
        unreadCounts,
      };
      try {
        const serialized = JSON.stringify(gameState);
        localStorage.setItem(LOCAL_STORAGE_STATE_KEY, serialized);
        setHasSavedGame(true); 
      } catch (error) {
        console.error("Failed to save game state:", error);
      }
    }
  }, [
    currentView, chatHistories, activeChatTargetId, lastOpenedChat, lilyChatInitialized,
    isLilyTrusting, activeAppsInOverview, browserCurrentUrl, browserHistory, browserBookmarks,
    browserContentView, calculatorDisplayValue, filesUnlocked, skullsSystemUnlocked, relocationEta,
    lastMessageTimestamps, messengerFirstOpenedThisSession, unreadCounts, appStatus, isStateLoaded
  ]);


  const renderContent = () => {
    switch (currentView) {
      case 'game_start': return <GameStartScreen onNewGame={handleNewGame} onLoadGame={handleLoadGame} hasSavedGame={hasSavedGame} />;
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
                  unreadCounts={unreadCounts}
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
                  history={browserHistory}
                  bookmarks={browserBookmarks}
                  isBookmarked={isUrlBookmarked}
                  onToggleBookmark={handleToggleBookmark}
                  contentView={browserContentView}
                  onSetContentView={setBrowserContentView}
                  onRemoveBookmark={removeBrowserBookmark}
                />;
      case 'calculator':
        return <CalculatorScreen
                  initialDisplayValue={calculatorDisplayValue}
                  onDisplayChange={setCalculatorDisplayValue}
                />;
      default: return <GameStartScreen onNewGame={handleNewGame} onLoadGame={handleLoadGame} hasSavedGame={hasSavedGame} />;
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
  
  // Calculate padding for main content area based on visible fixed elements
  let mainContentPaddingTop = '';
  if (showMacOSTopBar) mainContentPaddingTop = 'pt-8'; // MacOSTopBar height
  
  let mainContentPaddingBottom = '';
  if (showNavigationControls) mainContentPaddingBottom = 'pb-16'; // NavigationControls height (h-16)

  return (
    <div className="h-full w-full flex flex-col bg-black relative"> {/* Added relative for fixed positioning context if needed elsewhere */}
      {isSigningOut && <SigningOutScreen />}

      {!isSigningOut && (
        <>
          {showMacOSTopBar && (
            <MacOSTopBar
              onRequestSignOut={requestSignOut}
              currentNotification={currentNotification}
              onNotificationClick={handleNotificationClick}
            />
          )}
          {/* Main content area that takes remaining space */}
          <div 
            className={`flex-grow flex flex-col overflow-hidden 
                        ${mainContentPaddingTop} ${mainContentPaddingBottom}`}
          >
            {showApiKeyBanner && <ApiKeyBanner />}
            <main className="flex-grow overflow-hidden relative"> {/* This main will contain the actual view */}
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
          
          {/* Navigation Controls, now potentially fixed */}
          {showNavigationControls && (
            <div className="fixed bottom-0 left-0 right-0 z-20"> {/* Wrapper for fixed positioning */}
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
            </div>
          )}

          {isSignOutConfirmVisible && (
            <SignOutConfirmationDialog
              isOpen={isSignOutConfirmVisible}
              onConfirm={confirmAndProceedSignOut}
              onCancel={cancelSignOut}
            />
          )}
          {isNewGameConfirmVisible && ( 
            <NewGameConfirmationDialog
              isOpen={isNewGameConfirmVisible}
              onConfirm={confirmAndStartNewGame}
              onCancel={cancelNewGameConfirmation}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
