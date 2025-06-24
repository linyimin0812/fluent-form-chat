import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageBubble from './MessageBubble';
import DynamicForm from './DynamicForm';
import { ChatMessage, FormSchema } from '@/types/chat';

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
  },
  {
    name: 'supporting_documents',
    label: 'Upload Supporting Documents',
    type: 'file',
    values: [],
    accept: '.pdf,.doc,.docx,.txt',
    multiple: true
  },
  {
    name: 'profile_image',
    label: 'Profile Image',
    type: 'file',
    values: [],
    accept: 'image/*',
    multiple: false
  }
];

const ChatPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [submittedDynamicFormData, setSubmittedDynamicFormData] = useState<Record<string, Record<string, any>> | null>(null);
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
      "I understand you'd like to discuss this topic. ",
      "Please provide the following details so I can better assist you:"
    ];
    
    const fullResponse = responses.join(' ');
    
    for (let i = 0; i <= fullResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
      const currentText = fullResponse.slice(0, i);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: currentText }
          : msg
      ));
    }

    setMessages(prev => prev.map(msg => 
      msg.id === aiMessageId 
        ? { ...msg, isStreaming: false, formSchema: mockSchema }
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

  const handleFormSubmit = async (id: string, formData: Record<string, any>) => {

    setSubmittedDynamicFormData(prev => {
      return {
        ...prev,
        [id]: formData
      };
    });

    setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join(', '),
        role: 'user',
        timestamp: new Date(),
        isStreaming: false
    }]);
    
    // Continue with AI response processing the form data
    setTimeout(async () => {
      // Create AI response message after processing form data
      const aiMessageId = Date.now().toString();
      const aiMessage: ChatMessage = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsStreaming(true);

      // Simulate AI processing the form data with streaming response
      const formProcessingResponse = `Thank you for providing the additional information. Based on your preferences (${Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join(', ')}), I can now provide you with a more tailored response. Let me analyze this information and give you the best recommendations.`;
      
      for (let i = 0; i <= formProcessingResponse.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 5));
        const currentText = formProcessingResponse.slice(0, i);
        
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, content: currentText }
            : msg
        ));
      }

      // Complete the streaming - but DON'T hide the form
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));
      
      setIsStreaming(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 sticky top-0 z-20">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          AI Assistant Chat
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Interact with our advanced language model
        </p>
      </div>

      {/* Messages Container - Fixed to prevent blank sections with long forms */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-40">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <h2 className="text-lg font-medium mb-2">Welcome to AI Chat</h2>
                <p>Start a conversation by typing your message below.</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble message={message} />
              {message.formSchema && (
                <div className="max-w-2xl mx-auto mb-4">
                  <DynamicForm 
                    schema={message.formSchema} 
                    onSubmit={(data: Record<string, any>) => handleFormSubmit(message.id, data)}
                    submittedData={submittedDynamicFormData ? submittedDynamicFormData[message.id] : null}
                  />
                </div>
              )}
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Form */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!inputValue.trim() || isStreaming}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
