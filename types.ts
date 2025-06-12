
import React from 'react';

export enum Sender {
  User = 'User',
  Lily = 'Lily',
  System = 'System', // Used for kidnapper's messages (displayed as "Terminal") or actual system errors
  RelocationUnit = 'RelocationUnit',
}

export interface Message {
  id: string;
  sender: Sender;
  text?: string;
  imageUrl?: string;
  timestamp: Date;
  isLoading?: boolean; 
  isError?: boolean; 
  isSeen?: boolean; // Added to track if the message has been seen by the user
}

export type ChatTargetId = 'lily' | 'relocation' | 'subject32' | 'subject33';
export type ChatTargetIdOrNull = ChatTargetId | null; // Added

export interface ChatContact {
  id: ChatTargetId;
  name: string; 
  avatarInitial: string;
  isResponsive: boolean;
  description?: string; 
}

// Define the View type here so it can be imported by App.tsx and other components if needed
export type View = 
  | 'game_start' 
  | 'intro' 
  | 'system_initiating' 
  | 'initial_load' 
  | 'home' 
  | 'chat' 
  | 'files_locked'      
  | 'files_unlocked'    
  | 'browser' 
  | 'calculator'
  | 'email' // Added Email app view
  | 'credits'; 

// Represents a file or item in the Files app
export interface FileItem { 
  id: string;
  title: string;
  icon: React.ReactElement<{ className?: string }>; 
  description: string;
  listItems?: string[];
  type: 'note' | 'photo'; 
  content?: string;       
  imageUrl?: string;      
  isLoadingImage?: boolean; 
}

export type BrowserContentView = 'page' | 'history' | 'bookmarks';

// Email App Types
export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'trash';

export interface Email {
  id: string;
  from: string; // email address or name
  to: string[]; // array of email addresses or names
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  folder: EmailFolder;
  attachments?: any[]; // Simplified for now
}
