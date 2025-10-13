import { redirect } from 'next/navigation';

// A página raiz redireciona para o dashboard (que está em /dashboard agora)
export default function HomePage() {
  redirect('/dashboard');
}