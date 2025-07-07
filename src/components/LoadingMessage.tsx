
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader } from 'lucide-react';

const LoadingMessage: React.FC = () => {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] xl:max-w-[70%]">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            AI
          </div>
          
          <div className="relative group min-w-0 flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400 text-sm">AI is thinking...</span>
            </div>
            <div className="mt-2 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
