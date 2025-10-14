"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { TrashBin2, CloseSquare } from '@solar-icons/react/ssr';

export interface BulkActionsBarProps {
  selectedCount: number;
  itemName: string;
  onDelete: () => void;
  onClear: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  itemName,
  onDelete,
  onClear,
  className = ""
}: BulkActionsBarProps) {
  
  const getItemText = () => {
    const singular = itemName.toLowerCase();
    const plural = singular.endsWith('s') ? singular : `${singular}s`;
    return selectedCount === 1 ? singular : plural;
  };

     return (
     <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 bg-background border border-border rounded-2xl p-4 flex items-center gap-4 z-50 transition-all duration-300 ${className}`}>
       <div className="flex items-center gap-3">
         <span className="text-sm font-medium text-foreground">
           {selectedCount} {getItemText()} selecionado{selectedCount > 1 ? 's' : ''}
         </span>
       </div>
       
       <div className="flex items-center gap-2">
         <Button
           onClick={onDelete}
           variant="ghost"
           size="sm"
           className="text-error hover:text-error/80 hover:bg-error/10 font-medium transition-all duration-200 cursor-pointer"
         >
           <TrashBin2 size={16} className="mr-1" />
           Excluir
         </Button>
         
         <Button
           onClick={onClear}
           variant="ghost"
           size="sm"
           className="text-muted-foreground hover:text-foreground hover:bg-elevation-1 font-medium transition-all duration-200 cursor-pointer"
         >
           <CloseSquare size={16} className="mr-1" />
           Limpar
         </Button>
       </div>
     </div>
   );
}
