import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
});

// Adicionando a validação de confirmação de senha
export const signUpSchema = z.object({
  name: z.string().min(1, { message: "O nome não pode ser vazio." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z
    .string()
    .min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  confirmPassword: z
    .string()
    .min(6, {
      message: "A confirmação de senha deve ter no mínimo 6 caracteres.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"], // Define o erro no campo de confirmação
});

export type SignInSchema = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;


export const createFolderSchema = z.object({
  name: z.string().min(1, { message: "O nome da pasta não pode ser vazio." }),
  parentId: z.string().optional(),
});

export type CreateFolderSchema = z.infer<typeof createFolderSchema>;