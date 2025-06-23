
import React from 'react';
import { ChatMessage } from '@/types/chat';
import StreamingText from './StreamingText';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] lg:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0
            ${isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
          `}>
            {isUser ? 'U' : 'AI'}
          </div>
          
          {/* Message Content */}
          <div className={`
            px-4 py-3 rounded-lg max-w-full
            ${isUser 
              ? 'bg-blue-500 text-white rounded-br-sm' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
            }
          `}>
            {message.isStreaming ? (
              <StreamingText text={message.content} />
            ) : (
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className={`
          text-xs text-gray-400 dark:text-gray-500 mt-1 px-11
          ${isUser ? 'text-right' : 'text-left'}
        `}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
