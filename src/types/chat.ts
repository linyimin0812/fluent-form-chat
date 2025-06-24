
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  formSchema?: FormSchema[];
  formTitle?: string; // Dynamic form title
}

export interface FormSchema {
  name: string;
  label: string;
  type: 'input' | 'select' | 'file' | 'radio' | 'checkbox' | 'switch' | 'textarea' | 'toggle' | 'toggle-group';
  values: string[];
  accept?: string; // For file inputs - specify accepted file types
  multiple?: boolean; // For file inputs - allow multiple files
  defaultValue?: any; // Default value for the field
  placeholder?: string; // Placeholder text
  description?: string; // Field description
  required?: boolean; // Whether field is required
}

export interface DynamicForm {
  
}
