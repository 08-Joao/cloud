'use client';

import { useUser } from "@/lib/hooks/use-auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Componente de Skeleton para a página de carregamento
function DashboardRedirectSkeleton() {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="space-y-4 text-center">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-6 w-64 mx-auto" />
            </div>
        </div>
    );
}


export default function DashboardRedirectPage() {
    const { data: user, isLoading } = useUser();

    useEffect(() => {
        // Quando o hook useUser tiver os dados do usuário...
        if (user && user.generalFolderId) {
            // ...redirecionamos para a pasta principal dele.
            redirect(`/dashboard/${user.generalFolderId}`);
        }
    }, [user]); // O efeito depende do objeto 'user'

    // Enquanto o useUser estiver carregando (após o invalidateQueries do signIn),
    // exibimos uma tela de loading.
    if (isLoading || !user) {
        return <DashboardRedirectSkeleton />;
    }

    // Este retorno é um fallback, mas o useEffect deve redirecionar antes.
    return <DashboardRedirectSkeleton />;
}