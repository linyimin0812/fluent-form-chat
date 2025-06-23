
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageBubble from './MessageBubble';
import DynamicForm from './DynamicForm';
import { ChatMessage, FormSchema } from '@/types/chat';

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<FormSchema[] | null>(null);
  const [isWaitingForForm, setIsWaitingForForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateStreamingResponse = async (userMessage: string, formData?: Record<string, any>) => {
    setIsStreaming(true);
    
    // Add user message
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Create AI response message
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, aiMessage]);

    // Simulate streaming response
    const responses = [
      "I understand you'd like to discuss this topic. Let me provide you with a comprehensive response.",
      "Based on your query, I need some additional information to give you the most accurate answer.",
      "Please provide the following details so I can better assist you:"
    ];
    
    const fullResponse = responses.join(' ');
    
    for (let i = 0; i <= fullResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      const currentText = fullResponse.slice(0, i);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: currentText }
          : msg
      ));
    }

    // Simulate server returning schema (randomly for demo)
    if (Math.random() > 0.3 && !formData) {
      setTimeout(() => {
        const mockSchema: FormSchema[] = [
          {
            name: 'user_preference',
            label: 'What is your preferred approach?',
            type: 'select',
            values: ['Conservative', 'Moderate', 'Aggressive']
          },
          {
            name: 'additional_context',
            label: 'Please provide additional context',
            type: 'input',
            values: []
          },
          {
            name: 'priority_level',
            label: 'Priority Level',
            type: 'select',
            values: ['Low', 'Medium', 'High', 'Critical']
          }
        ];
        
        setCurrentSchema(mockSchema);
        setIsWaitingForForm(true);
      }, 1000);
    }

    setMessages(prev => prev.map(msg => 
      msg.id === aiMessageId 
        ? { ...msg, isStreaming: false }
        : msg
    ));
    
    setIsStreaming(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const message = inputValue;
    setInputValue('');
    await simulateStreamingResponse(message);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setCurrentSchema(null);
    setIsWaitingForForm(false);
    
    // Continue with the form data
    const formSummary = Object.entries(formData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    await simulateStreamingResponse(`Form submitted with: ${formSummary}`, formData);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          AI Assistant Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Interact with our advanced language model
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <h2 className="text-lg font-medium mb-2">Welcome to AI Chat</h2>
              <p>Start a conversation by typing your message below.</p>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {currentSchema && isWaitingForForm && (
          <div className="max-w-2xl mx-auto">
            <DynamicForm 
              schema={currentSchema} 
              onSubmit={handleFormSubmit}
              isLoading={isStreaming}
            />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming || isWaitingForForm}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isStreaming || isWaitingForForm}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isWaitingForForm && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
              Please fill out the form above to continue the conversation.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
