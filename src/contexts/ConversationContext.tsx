
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface Conversation {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  currentConversation: Conversation | null;
  createConversation: (name?: string) => string;
  switchConversation: (id: string) => void;
  updateConversationMessages: (id: string, messages: ChatMessage[]) => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, name: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

export const ConversationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const currentConversation = conversations.find(conv => conv.id === currentConversationId) || null;

  const createConversation = (name?: string): string => {
    const id = uuidv4();
    const newConversation: Conversation = {
      id,
      name: name || `Conversation ${conversations.length + 1}`,
      messages: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversationId(id);
    return id;
  };

  const switchConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const updateConversationMessages = (id: string, messages: ChatMessage[]) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id 
        ? { ...conv, messages, lastUpdated: new Date() }
        : conv
    ));
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      const remaining = conversations.filter(conv => conv.id !== id);
      setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const renameConversation = (id: string, name: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id 
        ? { ...conv, name, lastUpdated: new Date() }
        : conv
    ));
  };

  return (
    <ConversationContext.Provider value={{
      conversations,
      currentConversationId,
      currentConversation,
      createConversation,
      switchConversation,
      updateConversationMessages,
      deleteConversation,
      renameConversation,
    }}>
      {children}
    </ConversationContext.Provider>
  );
};
