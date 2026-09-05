export interface Lead {
  id: string;
  name: string;
  email: string;
  projectScope: string;
  budget: string;
  customMessage: string;
  status: 'NEW' | 'IN_PROGRESS' | 'CLOSED';
  privateNotes: string;
  source: 'BOT' | 'FORM';
  createdAt: string;
  emailsSent: {
    type: 'CLIENT_ONBOARDING' | 'ADMIN_ALERT';
    sentAt: string;
    success: boolean;
    to: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
