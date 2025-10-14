"use client"

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrashBin2, DangerTriangle } from '@solar-icons/react/ssr';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  itemName?: string;
  isBulk?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  confirmText?: string;
  cancelText?: string;
  dangerText?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  itemName,
  isBulk = false,
  isLoading = false,
  loadingText = "Excluindo...",
  confirmText,
  cancelText = "Cancelar",
  dangerText
}: DeleteConfirmationModalProps) {
  
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getConfirmText = () => {
    if (confirmText) return confirmText;
    return isBulk ? "Excluir Itens" : "Excluir Item";
  };

  const getDangerText = () => {
    if (dangerText) return dangerText;
    return isBulk 
      ? "Esta ação não pode ser desfeita e excluirá permanentemente todos os itens selecionados."
      : "Esta ação não pode ser desfeita.";
  };

  return (
         <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
       <AlertDialogContent className="max-w-md mx-4 sm:mx-auto bg-background border border-border rounded-2xl">
         <AlertDialogHeader className="space-y-4">
           <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center">
               <TrashBin2 size={24} className="text-error" />
             </div>
             <div>
               <AlertDialogTitle className="text-xl font-semibold text-foreground">
                 {title}
               </AlertDialogTitle>
             </div>
           </div>
           
            <div className="text-left space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {description}{" "}
                {itemName && (
                  <span className="font-semibold text-foreground">
                    "{itemName}"
                  </span>
                )}
                ?
              </p>
              
              <div className="flex items-start gap-3 p-4 bg-error/5 border border-error/20 rounded-xl">
                <DangerTriangle size={20} className="text-error mt-0.5 flex-shrink-0" />
                <div className="text-sm text-error font-medium leading-relaxed">
                  {getDangerText()}
                </div>
              </div>
            </div>
         </AlertDialogHeader>
         
         <AlertDialogFooter className="gap-3 flex-col sm:flex-row pt-4">
           <AlertDialogCancel 
             onClick={handleCancel}
             disabled={isLoading}
             className="w-full sm:w-auto border-border hover:border-border/70 hover:bg-elevation-1 text-foreground font-medium transition-all duration-200 cursor-pointer"
           >
             {cancelText}
           </AlertDialogCancel>
           
           <AlertDialogAction
             onClick={handleConfirm}
             disabled={isLoading}
             className="w-full sm:w-auto bg-error hover:bg-error/90 text-error-foreground font-medium transition-all duration-200 cursor-pointer"
           >
             {isLoading ? (
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 border-2 border-error-foreground/30 border-t-error-foreground rounded-full animate-spin" />
                 {loadingText}
               </div>
             ) : (
               getConfirmText()
             )}
           </AlertDialogAction>
         </AlertDialogFooter>
       </AlertDialogContent>
     </AlertDialog>
  );
}
