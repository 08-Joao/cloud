import { CreateFolderSchema, SignInSchema, SignUpSchema } from "@/lib/validators";
import backendRoute from "./httpClient";

const Api = {
    signin: async function (data: SignInSchema) {
        try {
            const response = await backendRoute.post('/auth/signin',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )

            return response
        } catch (e) {
            console.log(e)
        }
    },
    signup: async function (data: SignUpSchema) {
        try {
            const response = await backendRoute.post('/auth/signup',
                data,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )

            return response
        } catch (e) {
            console.log(e)
        }
    },
    signout: async function () {
        try {
            const response = await backendRoute.post('/auth/signout', {}, { withCredentials: true })

            return response
        } catch(e) {
            console.log(e)
        }
    },
    getMe: async function () {
      try{
        const response = backendRoute.get('/auth/me', { withCredentials: true })

        return response
      }catch(e){
        console.log(e)
      }  
    },
    getFolderById(folderId: string) {
        try {
            const response = backendRoute.get(`/folder/${folderId}`, { withCredentials: true })

            return response
        } catch (e) {
            console.log(e)
        }
    },
    createFolder(data: CreateFolderSchema) {
        try {
            const response = backendRoute.post('/folder/create', data, { withCredentials: true })

            return response
        } catch (e) {
            console.log(e)
        }
    },
    uploadFiles(formData: FormData, folderId: string, onUploadProgress: (progress: number) => void) {
        try {
            const response = backendRoute.post(`/folder/${folderId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    // Calcula a porcentagem e passa apenas o número
                    if (progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        onUploadProgress(percentCompleted);
                    }
                },
                withCredentials: true
            })

            return response
        } catch (e) {
            console.log(e)
        }
    },
    downloadFile(fileId: string) {
        try {
            const response = backendRoute.get(`/folder/download/${fileId}`, {
                responseType: 'blob',
                withCredentials: true
            })

            return response
        } catch (e) {
            console.log(e)
        }
    }
}

export default Api