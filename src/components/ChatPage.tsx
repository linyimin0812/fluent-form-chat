import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MessageBubble from './MessageBubble';
import DynamicForm from './DynamicForm';
import { ChatMessage, FormSchema } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';


const mockCreateSchema: FormSchema[] = [
  {
    name: 'figmaUrl',
    label: 'figma设计稿链接',
    type: 'input',
    values: [],
  },
  {
    name: 'templateFile101',
    label: '分享合图模板文件1:1',
    type: 'file',
    values: [],
    accept: '.pdf,.doc,.docx,.txt,.psd',
    multiple: false,
    required: false
  },
  {
    name: 'templateFile169',
    label: '分享合图模板文件16:9',
    type: 'file',
    values: [],
    accept: '.pdf,.doc,.docx,.txt,.psd',
    multiple: false,
    required: false
  }
];

const mockBizTypeSchema: FormSchema[] = [
  {
    name: 'bizType',
    label: 'bizType',
    type: 'select',
    values: ['cashback', 'shakewin', 'prizeland'],
    defaultValue: 'cashback'
  },
  {
    name: 'spreadType',
    label: 'spreadType',
    type: 'input',
    values: [],
    defaultValue: 'default_spread_type'
  },
  {
    name: 'description',
    label: '场景描述',
    type: 'input',
    values: [],
    required: false,
    defaultValue: '组队PK，邀请好友一起参与活动，赢取奖励'
  }
];


const mockPanelSchema: FormSchema[] = [
  {
    name: 'sharePanelTitle',
    label: '标题',
    type: 'input',
    values: [],
    defaultValue: 'Team Up for Rewards!'
  },
  {
    name: 'sharePanelSubTitle',
    label: '副标题',
    type: 'input',
    values: [],
    defaultValue: '组队PK，邀请好友一起参与活动，赢取奖励'
  },
  {
    name: 'sharePanelTitleColor',
    label: '标题颜色',
    type: 'input',
    values: [],
    defaultValue: '#000000'
  },
  {
    name: 'sharePanelTitleSubColor',
    label: '副标题颜色',
    type: 'input',
    values: [],
    defaultValue: '#666666'
  },
  {
    name: 'backgroundUrl',
    label: '背景图片url',
    type: 'input',
    values: [],
    defaultValue: 'https://example.com/default-background.jpg'
  },
  {
    name: 'activityNamePicUrl',
    label: '活动名称图片url',
    type: 'input',
    values: [],
    defaultValue: 'https://example.com/default-background.jpg'
  }
];

const mockContentSchema: FormSchema[] = [
  {
    name: 'shareTitle',
    label: '分享标题',
    type: 'input',
    values: [],
    defaultValue: 'Team Up, Earn More'
  },
  {
    name: 'shareSubTitle',
    label: '分享副标题',
    type: 'input',
    values: [],
    defaultValue: '邀请好友组队PK，赢取奖励'
  },
  {
    name: 'templateId101',
    label: '模板ID（1:1）',
    type: 'input',
    values: [],
    defaultValue: uuidv4()
  },
  {
    name: 'templateId169',
    label: '模板ID（16:9）',
    type: 'input',
    values: [],
    defaultValue: uuidv4()
  }
];


const mockIsPreviewSchema: FormSchema[] = [
  {
    name: 'isPreview',
    label: '是否进行预览',
    type: 'switch',
    values: [],
    defaultValue: false,
    required: false,
  }
];

const mockPreviewSchema: FormSchema[] = [
  {
    name: 'dynamicContent1',
    label: '动态文案 1',
    type: 'input',
    values: [],
    defaultValue: '$ 1.00 Cashback for every friend you invite!'
  },
  {
    name: 'dynamicContent2',
    label: '动态文案 2',
    type: 'input',
    values: [],
    defaultValue: 'Invite 5 friends to earn a $5 bonus!'
  },
  {
    name: 'dynamicImage1',
    label: '动态图片 1',
    type: 'input',
    values: [],
    defaultValue: 'https://example.com/dynamic-image-1.jpg'
  },
  {
    name: 'dynamicImage2',
    label: '动态图片 2',
    type: 'input',
    values: [],
    defaultValue: 'https://example.com/dynamic-image-1.jpg'
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
      id: uuidv4(),
      content: userMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    // Create AI response message
    const aiMessageId = uuidv4();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, aiMessage]);

    let responses = [];

    if (/.*创建.*/.test(userMessage)) {
      responses = [
        `好的,开始为您创建分享配置。分为三步为您创建分享配置。

    1. 首先创建bizType和spreadType
    2. 然后创建面板配置
    3. 最后创建分享内容配置`,
        "分享配置创建需要您提供面板的figma设计稿链接和分享合图模板文件"
      ];
    }
    
    const fullResponse = responses.join('\n');
    
    for (let i = 0; i <= fullResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
      const currentText = fullResponse.slice(0, i);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: currentText }
          : msg
      ));
    }

    if (/.*创建.*/.test(userMessage)) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false, formSchema: mockCreateSchema, formTitle: '创建分享配置 - 第一步' }
          : msg
      ));
    }

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
        id: uuidv4(),
        content: ['```json', JSON.stringify(formData, null, 2), '```'].join("\n"),
        role: 'user',
        timestamp: new Date(),
        isStreaming: false
    }]);
    
    // Continue with AI response processing the form data
    // Create AI response message after processing form data
    const aiMessageId = uuidv4();

    let aiMessage: ChatMessage;

    // 预览结果
    if (formData &&  Object.keys(formData).includes('dynamicContent1')) {
      aiMessage = {
        id: aiMessageId,
        content: '![](https://img.alicdn.com/imgextra/i1/O1CN017XkYty23oN8j2TcaO_!!6000000007302-2-tps-1484-1302.png)',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: false
      };
      setMessages(prev => [...prev, aiMessage]);

      return;

    }

    aiMessage = {
      id: aiMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsStreaming(true);

    let formProcessingResponses: string[] = [`收到表单数据: \n`, '```json', JSON.stringify(formData, null, 2), '```'];

    // bizType和spreadType配置
    if (formData && Object.keys(formData).includes('figmaUrl')) {
      formProcessingResponses.push('根据您提供的figma设计稿链接和合图模板文件内容，为您生成分享bizType和spreadType。');
      formProcessingResponses.push('bizType和spreadType是分享场景的唯一标识，用于区分不同的分享场景');
    }

    // panel创建
    if (formData &&  Object.keys(formData).includes('bizType')) {
      formProcessingResponses.push('bizType和spreadType创建成功，开始为您创建面板配置');
    }

    // content创建
    if (formData &&  Object.keys(formData).includes('sharePanelTitle')) {
      formProcessingResponses.push('面板配置生成成功，开始为您创建分享内容配置');
    }

    // 是否预览
    if (formData &&  Object.keys(formData).includes('templateId101')) {
      formProcessingResponses.push('分享内容配置生成成功，是否进行预览？');
    }

    // 预览
    if (formData &&  Object.keys(formData).includes('isPreview')) {
      formProcessingResponses.push('预览生成成功，以下是预览内容：');
    }

    const formProcessingResponse = formProcessingResponses.join('\n');
    
    for (let i = 0; i <= formProcessingResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 5));
      const currentText = formProcessingResponse.slice(0, i);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, content: currentText }
          : msg
      ));
    }
    
    setIsStreaming(false);

    // bizType和spreadType配置完成后，渲染结果表单
    if (formData && Object.keys(formData).includes('figmaUrl')) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, formSchema: mockBizTypeSchema, formTitle: '创建分享配置 - 第二步' }
          : msg
      ));
    }

    // panel创建
    if (formData && Object.keys(formData).includes('bizType')) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, formSchema: mockPanelSchema, formTitle: '创建面板配置' }
          : msg
      ));
    }

    // content创建
    if (formData && Object.keys(formData).includes('sharePanelTitle')) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, formSchema: mockContentSchema, formTitle: '创建分享内容配置' }
          : msg
      ));
    }

    // 是否预览
    if (formData &&  Object.keys(formData).includes('templateId101')) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, formSchema: mockIsPreviewSchema, formTitle: '是否预览' }
          : msg
      ));
    }

    // 预览内容
    if (formData &&  Object.keys(formData).includes('isPreview')) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, formSchema: mockPreviewSchema, formTitle: '预览内容' }
          : msg
      ));
    }

    setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 sticky top-0 z-20">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Share Agent
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a share configuration by conversation
        </p>
      </div>

      {/* Messages Container - Fixed to prevent blank sections with long forms */}
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
