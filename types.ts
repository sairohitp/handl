import React from 'react';

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  status: 'available' | 'taken' | 'unknown' | 'checking' | 'owned';
  price: number;
  url?: string;
  details?: {
    message?: string;
    meta?: string; // e.g., "12k followers" or "Premium Domain"
    actionLabel?: string;
    actionUrl?: string;
  };
}

export interface PlatformDef {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SavedItem {
  handle: string;
  type: 'business' | 'project';
  timestamp: number;
  notes?: string;
}

export interface Folder {
  id: string;
  name: string;
  icon: 'layout-grid' | 'briefcase' | 'hash' | 'folder-kanban' | 'folder' | 'clock';
  type: 'system' | 'user';
  count?: number;
  items?: SavedItem[]; // List of handles saved in this folder
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  availableCount: number;
  totalCount: number;
  platforms: string[]; // List of platform IDs checked
}

export interface SearchState {
  query: string;
  isSearching: boolean;
  results: SocialPlatform[];
}