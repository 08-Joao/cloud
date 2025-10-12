import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FolderContent } from '../types';
import { CreateFolderSchema } from '../validators';
import Api from '@/services/Api';


// Hook para buscar o conteúdo de uma pasta
export const useFolderContent = (folderId: string) => {
    return useQuery<FolderContent>({
        queryKey: ['folder', folderId],
        queryFn: async () => {
            const { data } = await Api.getFolderById(folderId);
            return data;
        },
        enabled: !!folderId, // Só executa a query se folderId existir
    });
};

// Hook para criar uma nova pasta
export const useCreateFolder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (folderData: CreateFolderSchema) => {
            const { data } = await Api.createFolder(folderData);
            return data;
        },
        onSuccess: (_, variables) => {
            toast.success('Pasta criada com sucesso!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível criar a pasta.');
        },
    });
};