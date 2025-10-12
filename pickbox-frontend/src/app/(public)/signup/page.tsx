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
import { signUpSchema, SignUpSchema } from "@/lib/validators"
import { useSignUp } from "@/lib/hooks/use-auth"
import Link from "next/link";

export default function SignUpPage() {
    const { mutate: signUp, isPending } = useSignUp();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema),
    })

    function onSubmit(data: SignUpSchema) {
        signUp(data);
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
        <Card className="w-full max-w-sm">
        <CardHeader>
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
            Insira seus dados para se cadastrar.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome completo" {...register("name")} />
                    {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                    {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" {...register("password")} />
                    {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{" "}
              <Link href="/signin" className="underline">
                Entrar
              </Link>
            </div>
        </CardContent>
        </Card>
    </div>
  )
}