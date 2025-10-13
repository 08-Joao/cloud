import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { GetUserDto } from '../types';
import { SignInSchema, SignUpSchema } from '../validators';
import Api from '@/services/Api';

// Hook para buscar dados do usuário logado
export const useUser = () => {
    return useQuery<GetUserDto>({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await Api.getMe();
            if (!response) throw new Error("Failed to fetch user");
            return response.data;
        },
        retry: 1,
    });
};

// Hook para realizar login
export const useSignIn = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (credentials: SignInSchema) => {
            const response = await Api.signin(credentials);
            if (!response) throw new Error("Signin failed");
            // A resposta pode não ter corpo, então retornamos apenas o status ou true
            return response.status === 200 || response.status === 201; 
        },
        onSuccess: () => {
            // 1. Invalida a query 'user'. Isso fará com que o useUser refaça o fetch
            //    automaticamente, agora com o cookie de autenticação.
            queryClient.invalidateQueries({ queryKey: ['user'] });
            
            toast.success('Login realizado com sucesso!');
            
            // 2. Redireciona para uma página de "loading" do dashboard.
            router.push('/dashboard');
        },
        onError: (error: any) => {
            // O backend já limpa o cookie automaticamente quando o token é inválido
            toast.error(error.response?.data?.message || 'Falha no login. Verifique suas credenciais.');
        },
    });
};

// Hook para criar uma nova conta (SignUp)
export const useSignUp = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (credentials: SignUpSchema) => {
            const response = await Api.signup(credentials);
            if (!response) throw new Error("Signup failed");
            return response.data;
        },
        onSuccess: () => {
            toast.success('Conta criada com sucesso! Faça o login para continuar.');
            router.push('/signin');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Não foi possível criar a conta. Tente outro email.');
        },
    });
}

// Hook para realizar logout
export const useSignOut = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await Api.signout();
            if (!response) throw new Error("Signout failed");
            return response.data;
        },
        onSuccess: () => {
            queryClient.clear();
            router.push('/signin');
        },
        onError: () => {
            toast.error('Não foi possível fazer logout. Tente novamente.');
        },
    });
};