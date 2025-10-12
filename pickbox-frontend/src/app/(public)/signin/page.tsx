'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInSchema, SignInSchema } from "@/lib/validators"
import { useSignIn } from "@/lib/hooks/use-auth"
import Link from "next/link"; // Importar o Link

export default function SignInPage() {
    const { mutate: signIn, isPending } = useSignIn();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
    })

    function onSubmit(data: SignInSchema) {
        signIn(data);
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
            Entre com seu email e senha para acessar seus arquivos.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Entrando..." : "Entrar"}
            </Button>
            </form>
            {/* Adicionar esta seção */}
            <div className="mt-4 text-center text-sm">
              Não tem uma conta?{" "}
              <Link href="/signup" className="underline">
                Cadastre-se
              </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}