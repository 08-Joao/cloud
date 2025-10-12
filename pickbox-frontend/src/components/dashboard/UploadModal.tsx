'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatBytes } from '@/lib/utils';
import { UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useUploadFiles } from '@/lib/hooks/use-file';

interface UploadModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  folderId: string;
}

export function UploadModal({ isOpen, onOpenChange, folderId }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const { mutate: uploadFiles, isPending } = useUploadFiles(setProgress);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });
  
  const handleUpload = () => {
    if (files.length === 0) return;
    uploadFiles({ files, folderId }, {
        onSuccess: () => {
            setFiles([]);
            onOpenChange(false);
        },
        onSettled: () => {
            setProgress(0);
        }
    });
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload de Arquivos</DialogTitle>
          <DialogDescription>
            Arraste e solte os arquivos aqui ou clique para selecionar.
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-border'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {isDragActive ? 'Solte os arquivos aqui...' : 'Arraste ou clique para selecionar'}
          </p>
        </div>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            <h4 className='text-sm font-medium'>Arquivos selecionados:</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                <span className="truncate">{file.name} ({formatBytes(file.size)})</span>
                <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => removeFile(index)}>
                    <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isPending && (
            <div className='mt-4'>
                <Progress value={progress} />
                <p className='text-center text-sm mt-2'>{progress}%</p>
            </div>
        )}

        <Button onClick={handleUpload} disabled={files.length === 0 || isPending} className="mt-4 w-full">
          {isPending ? 'Enviando...' : 'Iniciar Upload'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}