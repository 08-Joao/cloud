'use client';
import Layout from '@/components/Layout';
import { useUser } from '@/context/userContext';
import { FolderEntity } from '@/data/entities/folder.entity';
import { formatBytes } from '@/lib/utils';
import Api from '@/services/Api';
import { Download, File, Folder2, PenNewSquare, Share, TrashBin2, Upload } from '@solar-icons/react/ssr';
import React, { useEffect, use, useState } from 'react'
import { motion } from 'framer-motion';
import UploadModal from '@/components/modals/uploadModal';
import EditFileModal from '@/components/modals/editFileModal';


const AuroraBackground = () => (
    <div className="absolute inset-0 -z-10 overflow-hidden opacity-40 dark:opacity-30">
        <div className="absolute top-1/4 left-1/4 h-[40vw] w-[40vw] animate-aurora rounded-full bg-blue-500/30 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[30vw] w-[30vw] animate-aurora-delay rounded-full bg-purple-500/30 blur-[120px]" />
    </div>
);

// Componente GlassCard
const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`rounded-3xl border border-slate-200/50 bg-white/50 shadow-2xl shadow-black/5 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/50 ${className}`}>
        {children}
    </div>
);

const FolderSkeleton = () => (
    <div className="space-y-8">
        {/* Skeleton das Pastas */}
        <div>
            <div className="h-8 w-32 bg-muted/50 rounded-lg mb-6 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <GlassCard key={i} className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-muted/50 rounded-2xl animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-muted/50 rounded animate-pulse w-3/4" />
                                <div className="h-4 bg-muted/50 rounded animate-pulse w-1/2" />
                            </div>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>

        {/* Skeleton dos Arquivos */}
        <div>
            <div className="h-8 w-24 bg-muted/50 rounded-lg mb-6 animate-pulse" />
            <GlassCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-foreground/10">
                            <tr>
                                <th className="px-6 py-4 text-center">
                                    <div className="h-3 bg-muted/50 rounded w-16 animate-pulse" />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="h-3 bg-muted/50 rounded w-12 animate-pulse" />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="h-3 bg-muted/50 rounded w-12 animate-pulse" />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="h-3 bg-muted/50 rounded w-24 animate-pulse" />
                                </th>
                                <th className="px-6 py-4 text-center">
                                    <div className="h-3 bg-muted/50 rounded w-16 animate-pulse mx-auto" />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-foreground/10">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-muted/50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-muted/50 rounded-xl animate-pulse" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-muted/50 rounded animate-pulse w-48" />
                                                <div className="h-3 bg-muted/50 rounded animate-pulse w-32" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-6 w-16 bg-muted/50 rounded animate-pulse" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-muted/50 rounded animate-pulse w-16" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-muted/50 rounded animate-pulse w-24" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {[1, 2, 3, 4].map((j) => (
                                                <div key={j} className="w-9 h-9 bg-muted/50 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    </div>
);


interface UploadingFile {
    name: string;
    size: number;
    progress: number;
    mimeType: string;
    originalName: string;
}

function Folder({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = use(params)
    const { user, loading, error, refreshUser } = useUser();
    const [loadedFolder, setLoadedFolder] = useState<FolderEntity | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [uploadingFile, setUploadingFile] = useState<UploadingFile | null>(null);
    const [editingFile, setEditingFile] = useState<any | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    
    const onUploadComplete = async () => {
        setIsOpen(false);
        setUploadingFile(null);
        // Recarregar a pasta para mostrar o novo arquivo
        const response = await Api.getFolderDetails(folderId);
        if (response) {
            setLoadedFolder(response.data);
        }
        refreshUser();
    };

    const onUploadProgress = (file: UploadingFile) => {
        setUploadingFile(file);
    };

    const onClose = () => {
        setIsOpen(false);
    };

    const handleEditFile = (file: any) => {
        setEditingFile(file);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        const response = await Api.getFolderDetails(folderId);
        if (response) {
            setLoadedFolder(response.data);
        }
        setIsEditModalOpen(false);
        setEditingFile(null);
    };

    const handleDownloadFile = async (fileId: string, fileName: string) => {
        try {
            setDownloadingFileId(fileId);
            setDownloadProgress(0);

            // 1. Obter token do backend
            const response = await Api.getDownloadToken(fileId);
            if (!response?.data?.token) {
                console.error('Token não obtido');
                setDownloadingFileId(null);
                return;
            }

            const baseURL = typeof window !== 'undefined' && window.location.hostname.endsWith('tehkly.com')
                ? 'https://api-cloud.tehkly.com'
                : 'http://localhost:4002';
            
            // 2. Obter URL do Backblaze
            const downloadUrlResponse = await fetch(`${baseURL}/files/download/${fileId}/${response.data.token}`);
            const data = await downloadUrlResponse.json();
            const backblazeUrl = data.downloadUrl;

            if (!backblazeUrl) {
                console.error('URL de download não obtida');
                setDownloadingFileId(null);
                return;
            }

            // 3. Fazer download direto do Backblaze com progresso
            const fileResponse = await fetch(backblazeUrl, {
                mode: 'cors',
                credentials: 'omit'
            });

            if (!fileResponse.ok) {
                throw new Error(`HTTP error! status: ${fileResponse.ok}`);
            }

            const contentLength = fileResponse.headers.get('content-length');
            const total = parseInt(contentLength || '0', 10);
            
            const reader = fileResponse.body?.getReader();
            if (!reader) throw new Error('No reader available');

            const chunks: BlobPart[] = [];
            let loaded = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                if (total > 0) {
                    const percentComplete = Math.round((loaded / total) * 100);
                    setDownloadProgress(percentComplete);
                }
            }

            // Combinar chunks em um único blob
            const blob = new Blob(chunks as BlobPart[]);
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setDownloadingFileId(null);
            setDownloadProgress(0);
        } catch (err) {
            console.error('Erro ao fazer download:', err);
            setDownloadingFileId(null);
            setDownloadProgress(0);
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        if (confirm('Tem certeza que deseja deletar este arquivo?')) {
            try {
                await Api.deleteFile(fileId);
                const response = await Api.getFolderDetails(folderId);
                if (response) {
                    setLoadedFolder(response.data);
                }
            } catch (err) {
                console.error('Erro ao deletar arquivo:', err);
            }
        }
    };


    useEffect(() => {
        async function fetchFolder() {
            const response = await Api.getFolderDetails(folderId)

            if (response) {
                setLoadedFolder(response.data)
            }
        }

        fetchFolder()
    }, [])

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return { icon: '📄', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
        if (mimeType.includes('presentation')) return { icon: '📊', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' };
        if (mimeType.includes('sheet')) return { icon: '📈', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' };
        return { icon: '📄', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' };
    };

    const getFileType = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('presentation')) return 'PPT';
        if (mimeType.includes('sheet')) return 'XLSX';
        return mimeType.split('/')[1]?.toUpperCase() || 'FILE';
    };


    return (
        <Layout isOpen={isOpen} setIsOpen={setIsOpen}>
            <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
                <AuroraBackground />


                {/* Conteúdo Principal */}
                <div className="container mx-auto px-6 py-8">
                    {!loadedFolder ? (
                        // Skeleton reutilizado aqui, no lugar de "Loading folder..."
                        <FolderSkeleton />
                    ) : (
                        <div className="space-y-8">
                            {/* Subpastas */}
                            {loadedFolder.subfolders && loadedFolder.subfolders.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
                                        Folders
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {loadedFolder.subfolders.map((subfolder: any, index: number) => (
                                            <motion.div
                                                key={subfolder.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                            >
                                                <GlassCard className="p-6 cursor-pointer group hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                                            <Folder2 className="w-6 h-6 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                                {subfolder.name}
                                                            </h3>
                                                            {subfolder.description && (
                                                                <p className="text-sm text-muted-foreground mt-1 truncate">{subfolder.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Arquivos */}
                            {loadedFolder.files && loadedFolder.files.length > 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">
                                        Files
                                    </h2>
                                    <GlassCard className="overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-muted/50 border-b border-foreground/10">
                                                    <tr>
                                                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Size
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Last Time Modified
                                                        </th>
                                                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-foreground/10">
                                                    {uploadingFile && (
                                                        <motion.tr
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="hover:bg-muted/50 transition-colors group bg-primary/5"
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-110 transition-transform duration-300 animate-pulse">
                                                                        📤
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <div className="font-medium text-foreground truncate">
                                                                            {uploadingFile.originalName}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            Enviando... {uploadingFile.progress}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="bg-elevation-1 w-fit px-2 py-1 rounded-sm flex items-center justify-center mx-auto">
                                                                    <span className='text-xs font-bold text-muted-foreground'>
                                                                        {uploadingFile.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-sm text-muted-foreground font-medium">
                                                                {formatBytes(uploadingFile.size)}
                                                            </td>
                                                            <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                                                                -
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                                                                    <div 
                                                                        className="bg-primary h-full transition-all duration-300"
                                                                        style={{ width: `${uploadingFile.progress}%` }}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    )}
                                                    {loadedFolder.files.map((file: any, index: number) => {
                                                        const fileIcon = getFileIcon(file.mimeType);
                                                        return (
                                                            <motion.tr
                                                                key={file.id}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                                className="hover:bg-muted/50 transition-colors group"
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-12 h-12 ${fileIcon.color} rounded-xl flex items-center justify-center flex-shrink-0 text-2xl group-hover:scale-110 transition-transform duration-300`}>
                                                                            {fileIcon.icon}
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="font-medium text-foreground truncate">
                                                                                {file.originalName}
                                                                            </div>
                                                                            {file.description && (
                                                                                <div className="text-sm text-muted-foreground truncate">
                                                                                    {file.description}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center">
                                                                    <div className="bg-elevation-1 w-fit px-2 py-1 rounded-sm flex items-center justify-center mx-auto">
                                                                        <span className='text-xs font-bold text-muted-foreground'>
                                                                            {getFileType(file.mimeType)}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 text-center text-sm text-muted-foreground font-medium">
                                                                    {formatBytes(file.size)}
                                                                </td>
                                                                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                                                                    {new Date(file.updatedAt).toLocaleDateString('pt-BR')}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {downloadingFileId === file.id ? (
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <span>{downloadProgress}%</span>
                                                                                <div className="w-16 bg-muted rounded-full h-1 overflow-hidden">
                                                                                    <div 
                                                                                        className="bg-primary h-full transition-all duration-300"
                                                                                        style={{ width: `${downloadProgress}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center justify-end gap-2">
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all duration-200"
                                                                                title="Compartilhar"
                                                                            >
                                                                                <Share className="w-5 h-5" />
                                                                            </motion.button>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                onClick={() => handleDownloadFile(file.id, file.name)}
                                                                                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all duration-200"
                                                                                title="Download"
                                                                            >
                                                                                <Download className="w-5 h-5" />
                                                                            </motion.button>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                onClick={() => handleEditFile(file)}
                                                                                className="p-2 text-muted-foreground hover:bg-muted rounded-xl transition-all duration-200"
                                                                                title="Editar"
                                                                            >
                                                                                <PenNewSquare className="w-5 h-5" />
                                                                            </motion.button>
                                                                            <motion.button
                                                                                whileHover={{ scale: 1.1 }}
                                                                                whileTap={{ scale: 0.9 }}
                                                                                onClick={() => handleDeleteFile(file.id)}
                                                                                className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
                                                                                title="Deletar"
                                                                            >
                                                                                <TrashBin2 className="w-5 h-5" />
                                                                            </motion.button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </motion.tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <GlassCard className="p-16 text-center">
                                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                            <File className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            Nenhum arquivo
                                        </h3>
                                        <p className="text-muted-foreground mb-6">
                                            Esta pasta está vazia. Faça upload do seu primeiro arquivo.
                                        </p>
                                        <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 inline-flex items-center gap-2 shadow-lg shadow-primary/30 font-semibold">
                                            <Upload className="w-5 h-5" />
                                            Fazer Upload
                                        </button>
                                    </GlassCard>
                                </motion.div>
                            )}
                            <UploadModal folderId={loadedFolder?.id || ''} isOpen={isOpen} onClose={onClose} onUploadComplete={onUploadComplete} onUploadProgress={onUploadProgress} />
                            {editingFile && (
                                <EditFileModal 
                                    fileId={editingFile.id}
                                    fileName={editingFile.name}
                                    fileDescription={editingFile.description}
                                    isOpen={isEditModalOpen}
                                    onClose={() => setIsEditModalOpen(false)}
                                    onSave={handleSaveEdit}
                                />
                            )}
                        </div>
                    )}
                </div>

                <style jsx global>{`
        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes aurora-delay {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 50px) scale(0.9); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
        .animate-aurora {
          animation: aurora 20s ease-in-out infinite;
        }
        .animate-aurora-delay {
          animation: aurora-delay 25s ease-in-out infinite;
        }
      `}</style>
            </div>
        </Layout>
    );
}



export default Folder