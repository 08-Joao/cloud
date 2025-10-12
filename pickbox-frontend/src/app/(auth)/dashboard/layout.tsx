'use client';
// Este layout age como um "protetor de rota" para o dashboard.

import { useUser } from "@/lib/hooks/use-auth";
import { redirect } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: user, isLoading, isError } = useUser();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Carregando sua sessão...</div>;
    }

    // Se a query falhar (ex: 401 Unauthorized), redireciona para o login
    if (isError || !user) {
        redirect('/signin');
    }
    
    // Se o usuário não tiver uma pasta geral definida, algo está errado
    if (!user.generalFolderId) {
        // Você pode redirecionar para uma página de erro ou de setup inicial
        redirect('/signin?error=no_general_folder');
    }

    // Se estiver tudo certo, renderiza a página filha
    return <>{children}</>;
}