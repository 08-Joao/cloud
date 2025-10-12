"use client"

import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { FieldRenderer } from './field-renderer';

export interface GenericStepperField<T = any> {
  name: keyof T;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'multiselect' | 'custom';
  placeholder?: string;
  required?: boolean;
  validation?: (value: any, allData: T) => string | null;
  formatInput?: (value: string) => string;
  options?: { value: string; label: string; color?: string }[];
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  rows?: number;
  component?: React.ComponentType<{
    value: any;
    onChange: (value: any) => void;
    error?: string;
    disabled?: boolean;
  }>;
  dependencies?: (keyof T)[];
  visible?: (data: T) => boolean;
  disabled?: (data: T) => boolean;
}

export interface GenericStepperStep<T = any> {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  fields: GenericStepperField<T>[];
  validation?: (data: T) => Record<string, string>;
  onStepEnter?: (data: T) => void | Promise<void>;
  onStepLeave?: (data: T) => void | Promise<void>;
}

export interface GenericStepperModalProps<T = any> {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  steps: GenericStepperStep<T>[];
  initialData?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  dataLoaders?: Record<string, () => Promise<any[]>>;
  onCancel?: () => void;
  isSaving?: boolean;
  saveButtonText?: string;
  cancelButtonText?: string;
  maxWidth?: string;
  loadingStates?: Record<string, boolean>;
}

export function GenericStepperModal<T extends Record<string, any>>({
  isOpen,
  onOpenChange,
  trigger,
  title,
  description,
  steps,
  initialData = {} as Partial<T>,
  onSubmit,
  dataLoaders = {},
  onCancel,
  isSaving = false,
  saveButtonText = "Salvar",
  cancelButtonText = "Cancelar",
  maxWidth = "max-w-3xl",
  loadingStates = {}
}: GenericStepperModalProps<T>) {
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<T>(initialData as T);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [externalData, setExternalData] = useState<Record<string, any[]>>({});

  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData as T);
      setCurrentStep(0);
      setErrors({});
    }
  }, [isOpen, initialData]);

  React.useEffect(() => {
    if (isOpen && Object.keys(dataLoaders).length > 0) {
      const loadData = async () => {
        for (const [key, loader] of Object.entries(dataLoaders)) {
          try {
            const data = await loader();
            setExternalData(prev => ({ ...prev, [key]: data }));
          } catch (error) {
            console.error(`Erro ao carregar dados para ${key}:`, error);
          }
        }
      };
      loadData();
    }
  }, [isOpen, dataLoaders]);

  const updateField = useCallback((fieldName: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (errors[fieldName as string]) {
      setErrors(prev => ({ ...prev, [fieldName as string]: '' }));
    }
  }, [errors]);

  const validateStep = useCallback((stepIndex: number, updateErrors: boolean = false): boolean => {
    const step = steps[stepIndex];
    if (!step) return true;

    const stepErrors: Record<string, string> = {};

    if (step.validation) {
      const customErrors = step.validation(formData);
      Object.assign(stepErrors, customErrors);
    }

    step.fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        stepErrors[field.name as string] = `${field.label} é obrigatório`;
        return;
      }

      if (field.validation && value !== undefined && value !== null && value !== '') {
        const error = field.validation(value, formData);
        if (error) {
          stepErrors[field.name as string] = error;
        }
      }
    });

    if (updateErrors) {
      setErrors(stepErrors);
    }
    
    return Object.keys(stepErrors).length === 0;
  }, [steps, formData]);

  const handleNext = useCallback(async () => {
    if (validateStep(currentStep, true) && currentStep < steps.length - 1) {
      const currentStepData = steps[currentStep];
      if (currentStepData.onStepLeave) {
        await currentStepData.onStepLeave(formData);
      }
      
      setCurrentStep(currentStep + 1);
      
      const nextStepData = steps[currentStep + 1];
      if (nextStepData.onStepEnter) {
        await nextStepData.onStepEnter(formData);
      }
    }
  }, [currentStep, steps, formData, validateStep]);

  const handlePrevious = useCallback(async () => {
    if (currentStep > 0) {
      const currentStepData = steps[currentStep];
      if (currentStepData.onStepLeave) {
        await currentStepData.onStepLeave(formData);
      }
      
      setCurrentStep(currentStep - 1);
      
      const prevStepData = steps[currentStep - 1];
      if (prevStepData.onStepEnter) {
        await prevStepData.onStepEnter(formData);
      }
    }
  }, [currentStep, steps, formData]);

  const handleStepClick = useCallback(async (stepIndex: number) => {
    for (let i = 0; i <= stepIndex && i < currentStep; i++) {
      if (!validateStep(i, true)) {
        return;
      }
    }
    
    const currentStepData = steps[currentStep];
    if (currentStepData.onStepLeave) {
      await currentStepData.onStepLeave(formData);
    }
    
    setCurrentStep(stepIndex);
    
    const targetStepData = steps[stepIndex];
    if (targetStepData.onStepEnter) {
      await targetStepData.onStepEnter(formData);
    }
  }, [currentStep, steps, formData, validateStep]);

  const handleSave = useCallback(async () => {
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i, true)) {
        setCurrentStep(i);
        return;
      }
    }

    await onSubmit(formData);
  }, [steps, formData, onSubmit, validateStep]);

  const handleCancel = useCallback(() => {
    setCurrentStep(0);
    setFormData(initialData as T);
    setErrors({});
    if (onCancel) {
      onCancel();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [initialData, onCancel, onOpenChange]);

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const currentStepData = steps[currentStep];

  const isCurrentStepValid = useMemo(() => {
    return validateStep(currentStep);
  }, [validateStep, currentStep]);

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      
      <AlertDialogContent className={`${maxWidth} max-h-[95vh] mx-4 sm:mx-auto bg-background border border-border/20 rounded-2xl shadow-xl backdrop-blur-xl p-0 overflow-hidden`}>
        <AlertDialogHeader className="px-6 pt-6 pb-4 border-b border-border/10">
          <AlertDialogTitle className="text-xl font-semibold text-foreground">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="px-6 py-4 bg-elevation-1/30 border-b border-border/10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium
                      transition-all duration-300 cursor-pointer shadow-sm
                      ${index < currentStep 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-500/30' 
                        : index === currentStep 
                        ? 'bg-gradient-to-r from-secondary to-blue-600 text-white shadow-secondary/30' 
                        : 'bg-background border border-border/30 text-muted-foreground hover:border-secondary/50'
                      }
                    `}
                    onClick={() => handleStepClick(index)}
                  >
                    {index < currentStep ? (
                      <Check size={16} />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${
                      index <= currentStep ? 'text-text' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4 transition-colors duration-300 rounded-full
                    ${index < currentStep ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-border/30'}
                  `} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="px-6 py-6 flex-1 overflow-y-auto max-h-[60vh] bg-background">
          {currentStepData && (
            <>
              <div className="flex items-center gap-3 mb-6 p-4 bg-elevation-1/20 rounded-xl border border-border/10">
                {currentStepData.icon && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-secondary/20 to-blue-500/20 flex items-center justify-center">
                    {currentStepData.icon}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentStepData.title}
                  </h3>
                  {currentStepData.description && (
                    <p className="text-sm text-muted-foreground">
                      {currentStepData.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {currentStepData.fields.map((field) => {
                  if (field.visible && !field.visible(formData)) {
                    return null;
                  }

                  const isFieldDisabled = isSaving || (field.disabled && field.disabled(formData));
                  const fieldError = errors[field.name as string];
                  const fieldValue = formData[field.name];

                  return (
                    <div key={field.name as string}>
                      <label className="form-label">
                        {field.label} {field.required && '*'}
                      </label>
                      
                      <FieldRenderer
                        field={field}
                        value={fieldValue}
                        onChange={(value) => updateField(field.name, value)}
                        error={fieldError}
                        disabled={isFieldDisabled}
                        externalData={externalData}
                        loadingStates={loadingStates}
                      />
                      
                      {fieldError && (
                        <p className="text-red-500 text-sm mt-2">{fieldError}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        
        <AlertDialogFooter className="px-6 py-4 border-t border-border/10 bg-elevation-1/20 backdrop-blur-sm">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isSaving}
              className="flex items-center gap-2 border-border/30 hover:border-secondary/50 hover:bg-secondary/10 hover:text-black cursor-pointer"
            >
              <ChevronLeft size={16} />
              Anterior
            </Button>

            <div className="flex items-center gap-3">
              <AlertDialogCancel 
                onClick={handleCancel}
                disabled={isSaving}
                className="border-border/30 hover:border-red-500/50 hover:bg-red-50 hover:text-red-600 cursor-pointer"
              >
                {cancelButtonText}
              </AlertDialogCancel>
              
              {isLastStep ? (
                <AlertDialogAction
                  onClick={handleSave}
                  disabled={isSaving || !isCurrentStepValid}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground cursor-pointer"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                      Salvando...
                    </div>
                  ) : (
                    saveButtonText
                  )}
                </AlertDialogAction>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground flex items-center gap-2 cursor-pointer"
                >
                  Próximo
                  <ChevronRight size={16} />
                </Button>
              )}
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
