import axios from "axios";

const baseURL =
    typeof window !== 'undefined' && window.location.hostname.endsWith('tehkly.com')
        ? 'https://api-cloud.tehkly.com/'
        : 'http://localhost:4002/';

const authURL =
    typeof window !== 'undefined' && window.location.hostname.endsWith('tehkly.com')
        ? 'https://api-auth.tehkly.com/'
        : 'http://localhost:4004/';

const backendRoute = axios.create({
    baseURL,
    withCredentials: true
})


const authRoute = axios.create({
    baseURL: authURL,
    withCredentials: true
})

// Interceptor para capturar erros 401 (Unauthorized)
backendRoute.interceptors.response.use(
    (response) => response,
    (error) => {
        // Se receber 401 e não estiver na página de login, redireciona
        if (error.response?.status === 401 && typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/signin') && !currentPath.startsWith('/signup')) {
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
);

export { authRoute, backendRoute };