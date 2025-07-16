import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, StopCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useConversation } from '@/contexts/ConversationContext';
import MessageBubble from '@/components/MessageBubble';
import LoadingMessage from '@/components/LoadingMessage';
import DynamicForm from '@/components/DynamicForm';
import { chatApiService, ChatApiMessage } from '@/services/chatApi';
import { ChatMessage } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

const ChatPage = () => {
  
  const { 
    currentConversation, 
    updateConversationMessages,
    createConversation 
  } = useConversation();
  
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [submittedDynamicFormData, setSubmittedDynamicFormData] = useState<Record<string, Record<string, any>> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentName = window.location.pathname?.split('/')[2] || 'share-agent';

  // Initialize first conversation if none exists
  useEffect(() => {
    if (!currentConversation) {
      createConversation(`${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Chat`);
    }
  }, [currentConversation, createConversation, agentName]);

  // Reset loading states when switching conversations
  useEffect(() => {
    if (currentConversation?.id) {
      console.log('Switching to conversation:', currentConversation.id, 'resetting loading states');
      setIsStreaming(false);
      setIsWaitingForResponse(false);
    }
  }, [currentConversation?.id]);

  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, isWaitingForResponse]);

  const updateMessages = (newMessages: ChatMessage[]) => {
    if (currentConversation) {
      updateConversationMessages(currentConversation.id, newMessages);
    }
  }; 

  const handleApiResponse = async (userMessage: string, formSubmitted: boolean) => {
    if (!currentConversation) return;
    
    setIsStreaming(true);
    setIsWaitingForResponse(true);
    
    // Add user message
    const newUserMessage: ChatMessage = {
      id: uuidv4(),
      chatContent: formSubmitted ? ['```json', userMessage, '```'].join("\n") : userMessage,
      role: 'user',
      timestamp: Date.now(),
    };
    
    const updatedMessages = [...messages, newUserMessage];
    updateMessages(updatedMessages);

    const chatApiMessage: ChatApiMessage = {
        role: newUserMessage.role,
        content: userMessage,
        formSubmitted: formSubmitted || false
    }

    try {
      // Use streaming for real-time response
      
      const agentName = window.location.pathname?.split('/')[2] || 'share-agent';
      const response = await chatApiService.stream(agentName, currentConversation.id, chatApiMessage, (chunk: ChatMessage) => {
        setIsWaitingForResponse(false); // Hide loading indicator once streaming starts
        updateMessages([...updatedMessages, {...chunk}]);
      });

      if (response.error) {
        const aiMessage: ChatMessage = {
          id: uuidv4(),
          chatContent: `Error: ${response.error}`,
          role: 'assistant',
          timestamp: Date.now()
        }
        updateMessages([...updatedMessages, {...aiMessage}]);
        setIsWaitingForResponse(false);
      } else {
        // Mark as complete
        updateMessages([...updatedMessages, {...response.message}]);
      }

    } catch (error) {
      const aiMessage: ChatMessage = {
          id: uuidv4(),
          chatContent: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          role: 'assistant',
          timestamp: Date.now(),
        }
        updateMessages([...updatedMessages, {...aiMessage}]);
        setIsWaitingForResponse(false);
    }

    setIsStreaming(false);
    setIsWaitingForResponse(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const message = inputValue;
    setInputValue('');

    await handleApiResponse(message, false);
  };

  const handleFormSubmit = async (id: string, formData: Record<string, any>) => {
    if (!currentConversation) return;

    // disable input while streaming
    setIsStreaming(true);
    
    setSubmittedDynamicFormData(prev => {
      return {
        ...prev,
        [id]: formData
      };
    });

    await handleApiResponse(JSON.stringify(formData, null, 2), true);
  };

  const handleRetry = async (messageId: string) => {
    // TODO: Implement retry functionality
  };

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Conversation Selected</h2>
          <p className="text-muted-foreground">Start a new conversation to begin chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex-shrink-0 sticky top-0 z-20 flex h-16">
        <SidebarTrigger className="mr-2 cursor-pointer" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate capitalize">
            {agentName} Chat
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chatting with {agentName} agent
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 space-y-4 pb-40">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <h2 className="text-lg font-medium mb-2 capitalize">Welcome to {agentName}</h2>
                <p>Start a conversation by typing your message below.</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id}>
              <MessageBubble 
                message={message} 
                onRetry={message.role === 'assistant' ? () => handleRetry(message.id) : undefined}
              />
              {message.formSchema && (
                <div className="max-w-2xl mx-auto mb-4">
                  <DynamicForm 
                    schema={message.formSchema} 
                    onSubmit={(data: Record<string, any>) => handleFormSubmit(message.id, data)}
                    submittedData={submittedDynamicFormData ? submittedDynamicFormData[message.id] : null}
                    title={message.formTitle}
                  />
                </div>
              )}
            </div>
          ))}
          
          {/* Show loading indicator only when waiting for response to start */}
          {isWaitingForResponse && <LoadingMessage />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Form */}
      <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage}>
            <div className="flex justify-center">
              <div className="flex gap-2 w-full max-w-2xl">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isStreaming ? "AI is responding..." : `Message ${agentName}...`}
                  disabled={isStreaming}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isStreaming}
                  size="sm"
                >
                  {isStreaming ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
