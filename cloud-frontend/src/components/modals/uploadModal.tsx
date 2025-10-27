'use client';
import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import Api from '@/services/Api';
import axios from 'axios';

// --- COMPONENTE DE MODAL DE VIDRO (Base) ---
function GlassModal({ isOpen, onClose, children, className = '' }: { 
    isOpen: boolean, 
    onClose: () => void, 
    children: React.ReactNode, 
    className?: string 
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`rounded-2xl border-foreground/10 bg-card/80 p-6 backdrop-blur-2xl ${className}`}>
                {children}
            </DialogContent>
        </Dialog>
    );
}


interface UploadingFile {
    name: string;
    size: number;
    progress: number;
    mimeType: string;
    originalName: string;
}

interface UploadModalProps {
    folderId: string;
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: (uploadedFile?: UploadingFile) => void;
    onUploadProgress?: (file: UploadingFile) => void;
}

interface SignedUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
  storageKey: string;
}

function UploadModal({ folderId, isOpen, onClose, onUploadComplete, onUploadProgress }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    
    // Estados de progresso
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Reseta o estado quando o modal é fechado/aberto
    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setName('');
            setDescription('');
            setTags('');
            setIsUploading(false);
            setUploadProgress(0);
            setUploadStatus('idle');
            setErrorMessage('');
        }
    }, [isOpen]);

    // Função para lidar com o arquivo (drop ou select)
    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile) {
            setFile(selectedFile);
            setName(selectedFile.name);
            setUploadStatus('idle');
            setUploadProgress(0);
        }
    };

    // Handlers de Drag-and-Drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };
    
    // Handler do input de clique
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    // Função para formatar tamanho do arquivo
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Constrói o FormData e faz o upload
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setUploadStatus('uploading');
        setUploadProgress(0);
        setErrorMessage('');

        try {
          // 1. Obter URL assinada
          const { data } = await Api.getSignedUploadUrl(
            folderId || '',
            name,
            file.type
          ) as { data: SignedUrlResponse };
          
          const { uploadUrl, authorizationToken, storageKey } = data;

          // 2. Fazer upload direto para o Backblaze
          await axios.post(uploadUrl, file, {
            headers: {
              'Authorization': authorizationToken,
              'Content-Type': file.type,
              'X-Bz-File-Name': encodeURIComponent(storageKey),
              'X-Bz-Content-Sha1': 'do_not_verify', // Ou calcule o SHA1 se preferir
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percent);
                
                // Chamar callback de progresso para mostrar na lista
                if (onUploadProgress) {
                  onUploadProgress({
                    name,
                    size: file.size,
                    progress: percent,
                    mimeType: file.type,
                    originalName: name
                  });
                }
              }
            }
          });

          // 3. Completar registro no backend
          await Api.completeFileUpload(folderId || '', {
            storageKey,
            name,
            size: file.size,
            mimeType: file.type,
            originalName: name,
            description,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
          });

          setUploadStatus('success');
          setTimeout(() => {
            onUploadComplete();
            onClose();
          }, 1500);
        } catch (error: unknown) {
          setUploadStatus('error');
          if (error instanceof Error) {
            setErrorMessage(error.message);
          } else if (axios.isAxiosError(error)) {
            setErrorMessage(error.response?.data?.message || 'Erro no upload');
          } else {
            setErrorMessage('Erro desconhecido');
          }
        } finally {
          setIsUploading(false);
        }
    };
    
    // Estilo para os inputs
    const glassInputStyle = "h-11 rounded-lg border-foreground/10 bg-card/50 backdrop-blur-md focus:bg-card/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/50";

    return (
        <GlassModal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-foreground">Fazer Upload de Arquivo</DialogTitle>
            </DialogHeader>

            {!file ? (
                // --- ESTADO 1: Drag-and-Drop ---
                <>
                    <DialogDescription className="text-muted-foreground">
                        Arraste e solte um arquivo ou clique para selecionar.
                    </DialogDescription>
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-4 flex min-h-[250px] w-full items-center justify-center rounded-xl border-2 border-dashed 
                                  border-foreground/20 bg-card/50 p-6 transition-colors
                                  ${isDragging ? 'border-primary/50 bg-primary/10' : 'hover:border-primary/50'}`}
                    >
                        <label htmlFor="file-upload" className="cursor-pointer text-center text-muted-foreground">
                            <Upload className="mx-auto h-12 w-12" />
                            <p className="mt-2 font-semibold">Arraste seu arquivo aqui</p>
                            <p className="text-sm">ou clique para selecionar</p>
                        </label>
                        <input id="file-upload" type="file" className="sr-only" onChange={onFileChange} />
                    </div>
                    <DialogFooter className="mt-6">
                        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    </DialogFooter>
                </>
            ) : (
                // --- ESTADO 2: Formulário de Metadados ---
                <form onSubmit={handleUpload}>
                    <div className="mb-4 rounded-lg bg-muted/50 p-3">
                        <DialogDescription className="text-foreground font-medium">
                            Arquivo selecionado: <span className="font-semibold">{file.name}</span>
                        </DialogDescription>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatFileSize(file.size)}
                        </p>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Nome do Arquivo</label>
                            <Input 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={glassInputStyle}
                                required
                                disabled={isUploading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Descrição (Opcional)</label>
                            <Input 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={glassInputStyle}
                                placeholder="Adicione uma breve descrição..."
                                disabled={isUploading}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground">Tags (Opcional)</label>
                            <Input 
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className={glassInputStyle}
                                placeholder="react, typescript, ..."
                                disabled={isUploading}
                            />
                            <p className="text-xs text-muted-foreground">Separe as tags por vírgula.</p>
                        </div>
                    </div>

                    {/* Barra de Progresso */}
                    {uploadStatus !== 'idle' && (
                        <div className="mt-6 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">
                                    {uploadStatus === 'uploading' && 'Enviando...'}
                                    {uploadStatus === 'success' && 'Upload concluído!'}
                                    {uploadStatus === 'error' && 'Erro no upload'}
                                </span>
                                <span className="text-muted-foreground">
                                    {uploadProgress}%
                                </span>
                            </div>
                            
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div 
                                    className={`h-full transition-all duration-300 ${
                                        uploadStatus === 'success' ? 'bg-green-500' :
                                        uploadStatus === 'error' ? 'bg-destructive' :
                                        'bg-primary'
                                    }`}
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>

                            {uploadStatus === 'success' && (
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Arquivo enviado com sucesso!</span>
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                    <XCircle className="h-4 w-4" />
                                    <span>{errorMessage || 'Erro ao enviar arquivo'}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button 
                            variant="ghost" 
                            type="button" 
                            onClick={() => setFile(null)}
                            disabled={isUploading}
                        >
                            Voltar
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isUploading || uploadStatus === 'success'}
                        >
                            {isUploading ? 'Enviando...' : 'Fazer Upload'}
                        </Button>
                    </DialogFooter>
                </form>
            )}
        </GlassModal>
    );
}

export default UploadModal;