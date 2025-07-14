import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, CheckCircle, XCircle, Loader, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ToolCall } from '@/types/chat';

interface ToolCallDisplayProps {
  toolCalls: ToolCall[];
  onConfirmExecution?: (toolCallId: string) => void;
  onCancelExecution?: (toolCallId: string) => void;
}

const ToolCallDisplay: React.FC<ToolCallDisplayProps> = ({ toolCalls, onConfirmExecution, onCancelExecution }) => {
  const [expandedCalls, setExpandedCalls] = useState<Set<string>>(new Set());

  const toggleExpanded = (toolCallId: string) => {
    setExpandedCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(toolCallId)) {
        newSet.delete(toolCallId);
      } else {
        newSet.add(toolCallId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'pending':
        return <Loader className="h-3 w-3 text-blue-500 animate-spin" />;
      case 'awaiting_confirmation':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Settings className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Running</Badge>;
      case 'awaiting_confirmation':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Needs Confirmation</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
        Tool Calls ({toolCalls.length})
      </div>
      
      {toolCalls.map((toolCall) => {
        const isExpanded = expandedCalls.has(toolCall.id);
        
        return (
          <div key={toolCall.id} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(toolCall.id)}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStatusIcon(toolCall.status)}
                    <span className="font-medium text-sm truncate">{toolCall.name}</span>
                    {getStatusBadge(toolCall.status)}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-3 pb-3">
                <div className="space-y-3">
                  {/* Parameters */}
                  {toolCall.parameters && Object.keys(toolCall.parameters).length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Parameters
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded border p-2">
                        <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(toolCall.parameters, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {toolCall.error && (
                    <div>
                      <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                        Error
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                        <div className="text-xs text-red-800 dark:text-red-200 break-words">
                          {toolCall.error}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Result */}
                  {toolCall.result && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Result
                      </div>
                      <div className="bg-white dark:bg-gray-900 rounded border p-2">
                        <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words">
                          {typeof toolCall.result === 'string' 
                            ? toolCall.result 
                            : JSON.stringify(toolCall.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  
                  {/* Confirmation Buttons */}
                  {toolCall.requiresConfirmation && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Manual Confirmation Required
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCancelExecution?.(toolCall.id)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onConfirmExecution?.(toolCall.id)}
                          className="flex-1"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
};

export default ToolCallDisplay;