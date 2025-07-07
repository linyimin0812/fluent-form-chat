import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageBubble from './MessageBubble';
import DynamicForm from './DynamicForm';
import { ChatMessage, FormSchema } from '@/types/chat';
import { useConversation } from '@/contexts/ConversationContext';
import { chatApiService, ChatApiMessage } from '@/services/chatApi';
import { v4 as uuidv4 } from 'uuid';
import { SidebarTrigger } from './ui/sidebar';
import LoadingMessage from './LoadingMessage';
import { Loader } from 'lucide-react';

const mockBizTypeSchema: FormSchema[] = [
  {
    name: 'bizType',
    label: 'bizType',
    type: 'select',
    values: [{ label: 'Cashback', value: 'cashback' }, { label: 'Shakewin', value: 'shakewin' }, { label: 'Prizeland', value: 'prizeland' }],
    defaultValue: 'cashback'
  },
  {
    name: 'spreadType',
    label: 'spreadType',
    type: 'input',
    defaultValue: 'default_spread_type'
  },
  {
    name: 'description',
    label: '场景描述',
    type: 'textarea',
    required: false,
    defaultValue: '组队PK，邀请好友一起参与活动，赢取奖励'
  }
];


const mockPanelSchema: FormSchema[] = [
  {
    name: 'sharePanelTitle',
    label: '标题',
    type: 'input',
    defaultValue: 'Team Up for Rewards!'
  },
  {
    name: 'sharePanelSubTitle',
    label: '副标题',
    type: 'input',
    defaultValue: '组队PK，邀请好友一起参与活动，赢取奖励'
  },
  {
    name: 'sharePanelTitleColor',
    label: '标题颜色',
    type: 'input',
    defaultValue: '#000000'
  },
  {
    name: 'sharePanelTitleSubColor',
    label: '副标题颜色',
    type: 'input',
    defaultValue: '#666666'
  },
  {
    name: 'backgroundUrl',
    label: '背景图片url',
    type: 'input',
    defaultValue: 'https://example.com/default-background.jpg'
  },
  {
    name: 'activityNamePicUrl',
    label: '活动名称图片url',
    type: 'input',
    defaultValue: 'https://example.com/default-background.jpg'
  }
];

const mockContentSchema: FormSchema[] = [
  {
    name: 'shareTitle',
    label: '分享标题',
    type: 'input',
    defaultValue: 'Team Up, Earn More'
  },
  {
    name: 'shareSubTitle',
    label: '分享副标题',
    type: 'input',
    defaultValue: '邀请好友组队PK，赢取奖励'
  },
  {
    name: 'templateId101',
    label: '模板ID（1:1）',
    type: 'input',
    defaultValue: uuidv4()
  },
  {
    name: 'templateId169',
    label: '模板ID（16:9）',
    type: 'input',
    defaultValue: uuidv4()
  }
];


const mockIsPreviewSchema: FormSchema[] = [
  {
    name: 'isPreview',
    label: '是否进行预览',
    type: 'switch',
    values: [{ label: '是', value: true }, { label: '否', value: false }],
    defaultValue: false,
    required: false,
  }
];

const mockPreviewSchema: FormSchema[] = [
  {
    name: 'dynamicContent1',
    label: '动态文案 1',
    type: 'input',
    defaultValue: '$ 1.00 Cashback for every friend you invite!'
  },
  {
    name: 'dynamicContent2',
    label: '动态文案 2',
    type: 'input',
    defaultValue: 'Invite 5 friends to earn a $5 bonus!'
  },
  {
    name: 'dynamicImage1',
    label: '动态图片 1',
    type: 'input',
    defaultValue: 'https://example.com/dynamic-image-1.jpg'
  },
  {
    name: 'dynamicImage2',
    label: '动态图片 2',
    type: 'input',
    defaultValue: 'https://example.com/dynamic-image-1.jpg'
  }
];


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

  // Initialize first conversation if none exists
  useEffect(() => {
    if (!currentConversation) {
      createConversation('New Chat');
    }
  }, [currentConversation, createConversation]);

  const messages = currentConversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await chatApiService.stream('agent', currentConversation.id, chatApiMessage, (chunk: ChatMessage) => {
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
        return;
      }

      // Mark as complete
      updateMessages([...updatedMessages, {...response.message}]);

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
    // await simulateStreamingResponse(message);

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

  if (!currentConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-medium mb-2">No conversation selected</h2>
          <p className="text-muted-foreground">Create a new conversation to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex-shrink-0 sticky top-0 z-20 flex">
        <SidebarTrigger className="mr-2 cursor-pointer" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
            {currentConversation.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a share configuration by conversation
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 pb-40">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <h2 className="text-lg font-medium mb-2">Welcome to Share Agent</h2>
                <p>Create a share configuration by typing your requirements below.</p>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isStreaming ? "AI is responding..." : "Type your message..."}
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
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
