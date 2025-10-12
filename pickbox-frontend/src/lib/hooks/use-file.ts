import Api from '@/services/Api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UploadPayload {
    files: File[];
    folderId: string;
}

// Hook para upload de arquivos
export const useUploadFiles = (onUploadProgress: (progress: number) => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ files, folderId }: UploadPayload) => {
            const formData = new FormData();
            formData.append('folderId', folderId);
            files.forEach(file => {
                formData.append('files', file);
            });

            const { data } = await Api.uploadFiles(formData, folderId, onUploadProgress);
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success('Arquivos enviados com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['folder', variables.folderId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Falha no upload.');
        },
    });
};

// Hook para download de arquivo
export const useDownloadFile = () => {
    return useMutation({
        mutationFn: async ({ fileId, filename }: { fileId: string; filename: string }) => {
            const response = await Api.downloadFile(fileId);
            // Cria um link temporário para iniciar o download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        },
        onError: () => {
            toast.error('Não foi possível baixar o arquivo.');
        }
    });
};