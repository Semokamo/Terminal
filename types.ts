
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
  | 'credits'; // Added new credits view

// Represents a file or item in the Files app
export interface FileItem { // Renamed from GalleryItem
  id: string;
  title: string;
  // Type for icon allowing className to be passed via React.cloneElement
  icon: React.ReactElement<{ className?: string }>; 
  description: string;
  listItems?: string[];
  type: 'note' | 'photo'; // Type of the file item
  content?: string;       // For text content of a note, if different from description
  imageUrl?: string;      // For URL of an image if type is 'photo'
  isLoadingImage?: boolean; // To indicate if the image for this item is currently loading
}

export type BrowserContentView = 'page' | 'history' | 'bookmarks';
