
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types/chat';
import StreamingText from './StreamingText';
import { Button } from '@/components/ui/button';

import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

import json from 'highlight.js/lib/languages/json';


interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

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
            px-4 py-3 rounded-lg max-w-full relative group
            ${isUser 
              ? 'bg-blue-500 text-white rounded-br-sm' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
            }
          `}>
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`
                absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0
                ${isUser ? 'text-white hover:bg-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>

            {message.isStreaming ? (
              <StreamingText text={message.content} />
            ) : (
              <div className="whitespace-pre-wrap break-words pr-8">
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:m-0 prose-p:leading-relaxed">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeHighlight, { languages: { json } }]]}
                      components={{
                        img: ({ src, alt }) => (
                          <img
                            src={src ?? ''}
                            alt={alt ?? ''}
                            className="my-2 rounded shadow"
                            style={{ display: 'block', margin: '8px 0', maxWidth: '300px', height: 'auto' }} // 指定最大宽度
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
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
