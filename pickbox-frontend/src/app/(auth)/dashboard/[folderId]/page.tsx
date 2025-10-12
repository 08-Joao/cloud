'use client';
// Marcamos como client component pois a interatividade (abrir modais)
// e o fetch de dados pós-navegação acontecem aqui.

import { use } from 'react';
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { useUser } from "@/lib/hooks/use-auth";

interface DashboardPageProps {
    params: Promise<{
        folderId: string;
    }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
    // Unwrap the params Promise using React.use()
    const { folderId } = use(params);
    
    const { data: user, isLoading } = useUser();

    // O layout já protege a rota, mas podemos ter um loading aqui
    if (isLoading || !user) {
        // Ou mostrar um skeleton mais elaborado
        return <div>Carregando usuário...</div>;
    }
    
    return <DashboardClient initialFolderId={folderId} user={user} />;
}