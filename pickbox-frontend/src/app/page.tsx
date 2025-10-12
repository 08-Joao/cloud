import { redirect } from 'next/navigation';

// A página raiz pode simplesmente redirecionar para a página de login
// ou futuramente ser uma landing page.
export default function HomePage() {
  redirect('/signin');
}