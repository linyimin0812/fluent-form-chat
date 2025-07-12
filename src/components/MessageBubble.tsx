
import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';
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
  onRetry?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.chatContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 mx-[14px]`}>
      <div className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] xl:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar and Message Content */}
        <div className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5
            ${isUser 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }
          `}>
            {isUser ? 'U' : 'AI'}
          </div>
          
          {/* Message Content - Optimized for text wrapping */}
          <div className={`
            relative group min-w-0 flex-1 transform-gpu
            ${isUser 
              ? 'bg-blue-500 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 shadow-sm' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm'
            }
          `}>
            {/* Content Container - Enhanced for better text wrapping */}
            <div className="relative min-w-0">
              {message.isStreaming ? (
                <div className="min-h-[1.25rem]">
                  <StreamingText text={message.chatContent} />
                </div>
              ) : (
                <div className="break-words overflow-wrap-anywhere">
                  <div className={`
                    prose prose-sm max-w-none prose-p:my-1 prose-p:leading-relaxed
                    ${isUser 
                      ? 'prose-invert prose-headings:text-white prose-strong:text-white prose-code:text-white prose-pre:bg-blue-600' 
                      : 'dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white'
                    }
                    prose-headings:font-semibold prose-headings:my-2
                    prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                    prose-blockquote:my-2 prose-blockquote:border-l-2
                    prose-code:text-sm prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:break-all
                    prose-pre:text-sm prose-pre:rounded-lg prose-pre:my-2 prose-pre:overflow-x-auto
                  `}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[[rehypeHighlight, { languages: { json } }]]}
                      components={{
                        img: ({ src, alt }) => (
                          <img
                            src={src ?? ''}
                            alt={alt ?? ''}
                            className="my-2 rounded-lg shadow-sm max-w-full h-auto"
                          />
                        ),
                        p: ({ children }) => (
                          <p className="my-1 last:mb-0 first:mt-0 break-words">{children}</p>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="break-all">{children}</code>
                          ) : (
                            <code className={className}>{children}</code>
                          );
                        },
                        pre: ({ children }) => (
                          <pre className="overflow-x-auto whitespace-pre-wrap break-words">{children}</pre>
                        ),
                      }}
                    >
                      {message.chatContent}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        
        {/* Timestamp and Action Buttons - Full width container */}
        <div className={`flex justify-between items-center mt-1.5 group ${isUser ? 'pr-[42px]' : 'pl-[42px]'}`}>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {new Date(message.timestamp || Date.now()).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`
                h-6 w-6 p-0 rounded-md
                ${isUser 
                  ? 'text-white/70 hover:text-white hover:bg-white/10' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
            
            {/* Retry Button - Only for AI messages */}
            {!isUser && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 w-6 p-0 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Retry this message"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
