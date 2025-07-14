
export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  status?: 'pending' | 'success' | 'error' | 'awaiting_confirmation';
  error?: string;
  requiresConfirmation?: boolean;
}

export interface ChatMessage {
  id: string;
  chatContent: string;
  role: 'user' | 'assistant';
  timestamp: number;
  isStreaming?: boolean;
  formSchema?: FormSchema[];
  formTitle?: string; // Dynamic form title
  toolCalls?: ToolCall[];
}

export interface FormSchema {
  name: string;
  label: string;
  type: 'input' | 'select' | 'file' | 'radio' | 'checkbox' | 'switch' | 'textarea' | 'toggle' | 'toggle-group';
  values?: { label: string; value: any }[]; // For select, radio, checkbox, toggle-group
  accept?: string; // For file inputs - specify accepted file types
  multiple?: boolean; // For file inputs - allow multiple files
  defaultValue?: any; // Default value for the field
  placeholder?: string; // Placeholder text
  description?: string; // Field description
  required?: boolean; // Whether field is required
}

export interface DynamicForm {
  
}
