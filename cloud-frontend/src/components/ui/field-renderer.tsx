"use client"

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericStepperField } from './generic-stepper-modal';

interface FieldRendererProps<T> {
  field: GenericStepperField<T>;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  externalData: Record<string, any[]>;
  loadingStates: Record<string, boolean>;
}

export function FieldRenderer<T>({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled = false, 
  externalData, 
  loadingStates 
}: FieldRendererProps<T>) {
  
  const baseInputClass = `form-input ${error ? 'border-red-500' : ''}`;
  const selectClass = `w-full h-12 px-4 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${error ? 'border-red-500' : ''}`;

  switch (field.type) {
    case 'text':
      return (
        <Input
          type="text"
          value={value || ''}
          onChange={(e) => {
            const newValue = field.formatInput ? field.formatInput(e.target.value) : e.target.value;
            onChange(newValue);
          }}
          placeholder={field.placeholder}
          className={baseInputClass}
          disabled={disabled}
          maxLength={field.maxLength}
        />
      );

    case 'textarea':
      return (
        <div>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`w-full min-h-[120px] px-4 py-3 border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${error ? 'border-red-500' : ''}`}
            disabled={disabled}
            rows={field.rows || 4}
            maxLength={field.maxLength}
          />
          {field.maxLength && value && (
            <p className="text-gray-500 text-sm mt-2">
              {value.length}/{field.maxLength} caracteres
            </p>
          )}
        </div>
      );

    case 'number':
      return (
        <Input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder}
          className={baseInputClass}
          disabled={disabled}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );

    case 'select':
      const externalOptions = externalData[field.name as string] || [];
      const selectOptions = externalOptions.length > 0 ? externalOptions : (field.options || []);
      const isLoading = loadingStates[field.name as string] || false;
      
      return (
        <Select
          value={value || ''}
          onValueChange={onChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className={selectClass}>
            <SelectValue placeholder={isLoading ? "Carregando..." : field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.length === 0 ? (
              <SelectItem value="" disabled>
                Nenhuma opção disponível
              </SelectItem>
            ) : (
              selectOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.color ? (
                    <span className={option.color}>
                      {option.label}
                    </span>
                  ) : (
                    option.label
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      );

    case 'multiselect':
      const multiOptions = field.options || [];
      const selectedValues = Array.isArray(value) ? value : [];
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50">
          {multiOptions.length === 0 ? (
            <div className="col-span-2 text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Nenhuma opção disponível</p>
            </div>
          ) : (
            multiOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200">
                <Checkbox
                  id={`${field.name as string}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked 
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v: any) => v !== option.value);
                    onChange(newValues);
                  }}
                  disabled={disabled}
                />
                <label
                  htmlFor={`${field.name as string}-${option.value}`}
                  className="text-sm text-gray-700 cursor-pointer flex-1 font-medium"
                >
                  {option.label}
                </label>
              </div>
            ))
          )}
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name as string}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={disabled}
          />
          <label
            htmlFor={field.name as string}
            className="text-sm text-gray-700 cursor-pointer"
          >
            {field.placeholder || field.label}
          </label>
        </div>
      );

    case 'custom':
      if (field.component) {
        const CustomComponent = field.component;
        return (
          <CustomComponent
            value={value}
            onChange={onChange}
            error={error}
            disabled={disabled}
          />
        );
      }
      return <div className="text-red-500">Componente customizado não fornecido</div>;

    default:
      return <div className="text-red-500">Tipo de campo não suportado: {field.type}</div>;
  }
}

export function useGenericStepperModal() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  const handleSave = async (saveFunction: () => Promise<void>) => {
    setIsSaving(true);
    try {
      await saveFunction();
      closeModal();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isOpen,
    isSaving,
    openModal,
    closeModal,
    handleSave,
    setIsOpen,
    setIsSaving
  };
}
