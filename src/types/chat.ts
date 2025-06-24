
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  formSchema?: FormSchema[]
}

export interface FormSchema {
  name: string;
  label: string;
  type: 'input' | 'select' | 'file';
  values: string[];
  accept?: string; // For file inputs - specify accepted file types
  multiple?: boolean; // For file inputs - allow multiple files
}

export interface DynamicForm {
  
}
