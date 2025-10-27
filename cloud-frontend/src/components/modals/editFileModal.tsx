'use client';
import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader } from 'lucide-react';
import Api from '@/services/Api';

interface EditFileModalProps {
    fileId: string;
    fileName: string;
    fileDescription?: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

export default function EditFileModal({ 
    fileId, 
    fileName, 
    fileDescription = '',
    isOpen, 
    onClose, 
    onSave 
}: EditFileModalProps) {
    const [name, setName] = useState(fileName);
    const [description, setDescription] = useState(fileDescription);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(fileName);
            setDescription(fileDescription);
            setError('');
        }
    }, [isOpen, fileName, fileDescription]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('Nome do arquivo é obrigatório');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await Api.updateFile(fileId, {
                name: name.trim(),
                description: description.trim(),
            });
            onSave();
            onClose();
        } catch (err) {
            setError('Erro ao atualizar arquivo');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl border-foreground/10 bg-card/80 p-6 backdrop-blur-2xl max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-foreground">Editar Arquivo</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Atualize o nome e descrição do arquivo
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nome do Arquivo</label>
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-11 rounded-lg border-foreground/10 bg-card/50 backdrop-blur-md focus:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/50"
                            placeholder="Nome do arquivo"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Descrição (Opcional)</label>
                        <Input 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="h-11 rounded-lg border-foreground/10 bg-card/50 backdrop-blur-md focus:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/50"
                            placeholder="Adicione uma descrição..."
                            disabled={isLoading}
                        />
                    </div>

                    {error && (
                        <div className="text-sm text-destructive">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
