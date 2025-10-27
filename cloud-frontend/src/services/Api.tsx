import { CreateFolderDto, UpdateFolderDto } from "@/data/dtos/folder.dto";
import { backendRoute, authRoute } from "./httpClient";
import { CreateFolderShareDto, UpdateFolderShareDto } from "@/data/dtos/folder-share.dto";
import { CreateFileShareDto, UpdateFileShareDto } from "@/data/dtos/file-share.dto";

const Api = {

    // =================================================================
    // == AUTH (Rotas de Exemplo)
    // =================================================================

    signout: async function () {
        try {
            const response = await authRoute.post('/auth/signout', {}, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em signout:", e)
        }
    },
    getMe: async function () {
      try{
        const response = await backendRoute.get('/user/me', { withCredentials: true })
        return response
      }catch(e){
        console.error("Erro em getMe:", e)
      }  
    },
    // =================================================================
    // == FOLDERS (FolderController)
    // =================================================================

    createFolder: async function (data: CreateFolderDto) {
        try {
            const response = await backendRoute.post('/folders', data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em createFolder:", e)
        }
    },


    getFolders: async function () {
      try{
        const response = await backendRoute.get('/folders', { withCredentials: true })
        return response
      }catch(e){
        console.error("Erro em getFolders:", e)
      }  
    },

    getFolderDetails: async function (id: string) {
        try {
            const response = await backendRoute.get(`/folders/${id}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFolderDetails:", e)
        }
    },

    updateFolder: async function (id: string, data: UpdateFolderDto) {
        try {
            const response = await backendRoute.patch(`/folders/${id}`, data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em updateFolder:", e)
        }
    },


    deleteFolder: async function (id: string, recursive: boolean = false) {
        try {
            const response = await backendRoute.delete(`/folders/${id}`, { 
                params: { recursive },
                withCredentials: true 
            })
            return response
        } catch(e) {
            console.error("Erro em deleteFolder:", e)
        }
    },

    getFoldersSharedWithMe: async function () {
        try {
            const response = await backendRoute.get('/folders/shared-with-me', { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFoldersSharedWithMe:", e)
        }
    },

    getFoldersSharedByMe: async function () {
        try {
            const response = await backendRoute.get('/folders/shared-by-me', { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFoldersSharedByMe:", e)
        }
    },

    // =================================================================
    // == FOLDER SHARES (FolderShareController)
    // =================================================================

    createFolderShare: async function (data: CreateFolderShareDto) {
        try {
            const response = await backendRoute.post('/folder-shares', data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em createFolderShare:", e)
        }
    },


    getFolderShares: async function (folderId: string) {
        try {
            const response = await backendRoute.get(`/folder-shares/folder/${folderId}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFolderShares:", e)
        }
    },


    updateFolderShare: async function (id: string, data : UpdateFolderShareDto) {
        try {
            const response = await backendRoute.patch(`/folder-shares/${id}`, data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em updateFolderShare:", e)
        }
    },


    deleteFolderShare: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/folder-shares/${id}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em deleteFolderShare:", e)
        }
    },

    // =================================================================
    // == FILES (FileController)
    // =================================================================


    uploadFile: async function (formData: FormData, onProgress?: (progress: number) => void) {
        try {
            const response = await backendRoute.post('/files/upload', formData, { 
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onProgress(percentCompleted);
                    }
                }
            })
            return response
        } catch(e) {
            console.error("Erro em uploadFile:", e)
            throw e; // Re-lança o erro para que o componente possa capturá-lo
        }
    },

    getFiles: async function () {
      try{
        const response = await backendRoute.get('/files', { withCredentials: true })
        return response
      }catch(e){
        console.error("Erro em getFiles:", e)
      }  
    },


    getFilesByFolder: async function (folderId: string) {
        try {
            const response = await backendRoute.get('/files', { 
                params: { folderId },
                withCredentials: true 
            })
            return response
        } catch(e) {
            console.error("Erro em getFilesByFolder:", e)
        }
    },

    getFileDetails: async function (id: string) {
        try {
            const response = await backendRoute.get(`/files/${id}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFileDetails:", e)
        }
    },

    downloadFile: async function (id: string) {
        try {
            const response = await backendRoute.get(`/files/${id}/download`, { 
                withCredentials: true,
                responseType: 'blob' // Importante para o navegador tratar como download
            })
            return response
        } catch(e) {
            console.error("Erro em downloadFile:", e)
        }
    },

    getDownloadToken: async function (id: string) {
        try {
            const response = await backendRoute.get(`/files/${id}/download-token`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getDownloadToken:", e)
        }
    },

    updateFile: async function (id: string, data: any) {
        try {
            const response = await backendRoute.patch(`/files/${id}`, data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em updateFile:", e)
        }
    },

    deleteFile: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/files/${id}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em deleteFile:", e)
        }
    },


    getFilesSharedWithMe: async function () {
        try {
            const response = await backendRoute.get('/files/shared-with-me', { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFilesSharedWithMe:", e)
        }
    },


    getFilesSharedByMe: async function () {
        try {
            const response = await backendRoute.get('/files/shared-by-me', { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFilesSharedByMe:", e)
        }
    },

    // =================================================================
    // == FILE SHARES (FileShareController)
    // =================================================================


    createFileShare: async function (data : CreateFileShareDto) {
        try {
            const response = await backendRoute.post('/file-shares', data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em createFileShare:", e)
        }
    },


    getFileShares: async function (fileId: string) {
        try {
            const response = await backendRoute.get(`/file-shares/file/${fileId}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em getFileShares:", e)
        }
    },


    updateFileShare: async function (id: string, data : UpdateFileShareDto) {
        try {
            const response = await backendRoute.patch(`/file-shares/${id}`, data, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em updateFileShare:", e)
        }
    },

    deleteFileShare: async function (id: string) {
        try {
            const response = await backendRoute.delete(`/file-shares/${id}`, { withCredentials: true })
            return response
        } catch(e) {
            console.error("Erro em deleteFileShare:", e)
        }
    },

    getSignedUploadUrl: async function (folderId: string, fileName: string, mimeType: string) {
        try {
            const response = await backendRoute.post('/files/upload/signed', { 
                fileName, 
                mimeType,
                folderId 
            })
            return response
        } catch(e) {
            console.error("Erro em getSignedUploadUrl:", e)
        }
    },

    completeFileUpload: async function (
        folderId: string, 
        fileData: {
            storageKey: string;
            name: string;
            size: number;
            mimeType: string;
            originalName: string;
            description?: string;
            tags?: string[];
        }
    ) {
        try {
            const response = await backendRoute.post('/files/upload/complete', {
                storageKey: fileData.storageKey,
                metadata: {
                    ...fileData,
                    folderId
                }
            })
            return response
        } catch(e) {
            console.error("Erro em completeFileUpload:", e)
        }
    },
    
}

export default Api;