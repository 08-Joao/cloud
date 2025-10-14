'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createFolderSchema, CreateFolderSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useCreateFolder } from '@/lib/hooks/use-folder';

interface CreateFolderModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  parentId: string;
}

export function CreateFolderModal({ isOpen, onOpenChange, parentId }: CreateFolderModalProps) {
  const { mutate: createFolder, isPending } = useCreateFolder();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateFolderSchema>({
    resolver: zodResolver(createFolderSchema),
  });

  const onSubmit = (data: CreateFolderSchema) => {
    createFolder({ ...data }, {
        onSuccess: () => {
            reset();
            onOpenChange(false);
        }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Pasta</DialogTitle>
          <DialogDescription>
            Digite o nome da nova pasta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
                <Label htmlFor="name">Nome da Pasta</Label>
                <Input id="name" {...register('name')} placeholder="Ex: Documentos" />
                {errors.name && <p className='text-sm text-red-500 mt-1'>{errors.name.message}</p>}
            </div>

            <Button type='submit' disabled={isPending} className="w-full">
            {isPending ? 'Criando...' : 'Criar Pasta'}
            </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}