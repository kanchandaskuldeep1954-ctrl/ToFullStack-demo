export interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface RoadmapStage {
  id: string;
  title: string;
  description: string;
  duration: string;
  status: 'locked' | 'active' | 'completed';
  topics: string[];
}

export interface Lesson {
  id: number;
  title: string;
  objective: string;
  initialCode: string;
  validationCriteria: string; 
  xpReward: number;
  badgeReward?: string;
  why: string; // New field for "Why this matters"
}

export enum GameState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  PROCESSING = 'PROCESSING',
  SPEAKING = 'SPEAKING',
}

// Extend Window interface for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    webkitAudioContext: any;
  }
}
