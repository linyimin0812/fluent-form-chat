
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { FormSchema } from '@/types/chat';

interface DynamicFormProps {
  schema: FormSchema[];
  onSubmit: (data: Record<string, any>) => void;
  submittedData?: Record<string, any> | null;
  title?: string; // Dynamic title prop
}

const DynamicForm: React.FC<DynamicFormProps> = ({ 
  schema, 
  onSubmit, 
  submittedData = null,
  title = 'Additional Information Required'
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmitted = !!submittedData;

  // Initialize form data with default values and submitted data
  useEffect(() => {
    const initialData: Record<string, any> = {};
    
    // Set default values from schema
    schema.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    
    // Override with submitted data if available
    if (submittedData) {
      Object.assign(initialData, submittedData);
    }
    
    setFormData(initialData);
  }, [schema, submittedData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    if (isSubmitted) return; // Prevent changes after submission
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (isSubmitted || !files) return;
    
    const fileArray = Array.from(files);
    const fileData = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    
    const field = schema.find(f => f.name === fieldName);
    const value = field?.multiple ? fileData : fileData[0];
    
    handleFieldChange(fieldName, value);
  };

  const removeFile = (fieldName: string, index?: number) => {
    if (isSubmitted) return;
    
    const currentValue = formData[fieldName];
    if (Array.isArray(currentValue)) {
      const newFiles = currentValue.filter((_, i) => i !== index);
      handleFieldChange(fieldName, newFiles.length > 0 ? newFiles : null);
    } else {
      handleFieldChange(fieldName, null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    schema.forEach(field => {
      if (field.required !== false) { // Default to required unless explicitly set to false
        const value = formData[field.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitted) return; // Prevent resubmission
    
    if (validateForm()) {
      // Convert file objects to readable format for submission
      const submissionData = { ...formData };
      schema.forEach(field => {
        if (field.type === 'file' && submissionData[field.name]) {
          const value = submissionData[field.name];
          if (Array.isArray(value)) {
            submissionData[field.name] = value.map(f => f.name).join(', ');
          } else {
            submissionData[field.name] = value.name;
          }
        }
      });
      onSubmit(submissionData);
    }
  };

  const renderFileField = (field: FormSchema) => {
    const fieldValue = formData[field.name];
    const isDisabled = isSubmitted;
    const files = Array.isArray(fieldValue) ? fieldValue : (fieldValue ? [fieldValue] : []);

    return (
      <div className="space-y-2">
        <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
          isDisabled ? 'bg-gray-100 border-gray-300' : 'border-gray-300 hover:border-gray-400'
        } ${errors[field.name] ? 'border-red-500' : ''}`}>
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            {field.multiple ? 'Drop files here or click to browse' : 'Drop file here or click to browse'}
          </p>
          <Input
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            onChange={(e) => handleFileChange(field.name, e.target.files)}
            disabled={isDisabled}
            className="hidden"
            id={`file-${field.name}`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={() => document.getElementById(`file-${field.name}`)?.click()}
          >
            Browse Files
          </Button>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB • {file.type}
                  </p>
                </div>
                {!isDisabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(field.name, field.multiple ? index : undefined)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderField = (field: FormSchema) => {
    const fieldValue = formData[field.name] || '';
    const isDisabled = isSubmitted;

    switch (field.type) {
      case 'input':
        return (
          <Input
            id={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${errors[field.name] ? 'border-red-500' : ''} ${isDisabled ? 'bg-gray-100 text-gray-600' : ''}`}
            disabled={isDisabled}
            readOnly={isDisabled}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={`${errors[field.name] ? 'border-red-500' : ''} ${isDisabled ? 'bg-gray-100 text-gray-600' : ''}`}
            disabled={isDisabled}
            readOnly={isDisabled}
          />
        );
      
      case 'select':
        return (
          <Select
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={isDisabled}
          >
            <SelectTrigger className={`${errors[field.name] ? 'border-red-500' : ''} ${isDisabled ? 'bg-gray-100 text-gray-600' : ''}`}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.values.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={isDisabled}
            className={`${errors[field.name] ? 'border border-red-500 rounded p-2' : ''}`}
          >
            {field.values.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.name}-${index}`} />
                <Label htmlFor={`${field.name}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className={`space-y-2 ${errors[field.name] ? 'border border-red-500 rounded p-2' : ''}`}>
            {field.values.map((option, index) => {
              const isChecked = Array.isArray(fieldValue) ? fieldValue.includes(option) : false;
              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.name}-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      if (isDisabled) return;
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (checked) {
                        handleFieldChange(field.name, [...currentValues, option]);
                      } else {
                        handleFieldChange(field.name, currentValues.filter(v => v !== option));
                      }
                    }}
                    disabled={isDisabled}
                  />
                  <Label htmlFor={`${field.name}-${index}`}>{option}</Label>
                </div>
              );
            })}
          </div>
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={fieldValue || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
              disabled={isDisabled}
            />
            <Label htmlFor={field.name}>{fieldValue ? 'On' : 'Off'}</Label>
          </div>
        );

      case 'toggle-group':
        return (
          <ToggleGroup
            type={field.multiple ? 'multiple' : 'single'}
            value={fieldValue}
            onValueChange={(value) => handleFieldChange(field.name, value)}
            disabled={isDisabled}
            className={`${errors[field.name] ? 'border border-red-500 rounded p-2' : ''}`}
          >
            {field.values.map((option, index) => (
              <ToggleGroupItem key={index} value={option}>
                {option}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        );
      
      case 'file':
        return renderFileField(field);
      
      default:
        return (
          <Input
            id={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={isDisabled ? 'bg-gray-100 text-gray-600' : ''}
            disabled={isDisabled}
            readOnly={isDisabled}
          />
        );
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {isSubmitted ? 'Form Submitted' : title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isSubmitted 
            ? 'Thank you for providing the information. Processing your request...'
            : 'Please provide the following information to continue:'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {schema.map((field, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required !== false && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {field.description && (
                <p className="text-xs text-gray-500">{field.description}</p>
              )}
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-sm text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitted}
              className={`min-w-[100px] ${isSubmitted ? 'bg-gray-400 cursor-not-allowed' : ''}`}
            >
              {isSubmitted ? 'Submitted' : 'Submit'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;
