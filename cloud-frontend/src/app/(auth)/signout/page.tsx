'use client';

import { useSignOut } from "@/lib/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function SignOutPage() {
    const { mutate: signOut, isPending } = useSignOut();

    // Opcional: fazer logout assim que a página carrega
    // useEffect(() => {
    //   signOut();
    // }, [signOut])

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Sair</CardTitle>
                    <CardDescription>
                        Você tem certeza que deseja encerrar a sessão?
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => signOut()}
                        disabled={isPending}
                    >
                        {isPending ? 'Saindo...' : 'Sim, Sair'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}