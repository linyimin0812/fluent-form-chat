
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormSchema } from '@/types/chat';

interface DynamicFormProps {
  schema: FormSchema[];
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
  submittedData?: Record<string, any> | null;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ 
  schema, 
  onSubmit, 
  isLoading = false,
  submittedData = null 
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmitted = !!submittedData;

  // Initialize form data with submitted data if available
  useEffect(() => {
    if (submittedData) {
      setFormData(submittedData);
    }
  }, [submittedData]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    schema.forEach(field => {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitted) return; // Prevent resubmission
    
    if (validateForm()) {
      onSubmit(formData);
    }
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
            placeholder={`Enter ${field.label.toLowerCase()}`}
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
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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
      
      default:
        return (
          <Input
            id={field.name}
            value={fieldValue}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
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
          {isSubmitted ? 'Form Submitted' : 'Additional Information Required'}
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
              </Label>
              {renderField(field)}
              {errors[field.name] && (
                <p className="text-sm text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              disabled={isLoading || isSubmitted}
              className={`min-w-[100px] ${isSubmitted ? 'bg-gray-400 cursor-not-allowed' : ''}`}
            >
              {isSubmitted ? 'Submitted' : isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DynamicForm;
