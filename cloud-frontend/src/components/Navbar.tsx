'use client'

import { useUser } from "@/context/userContext"
import { useState } from "react"
import { Button } from "./ui/button"
import { Bell, MenuDots, Upload } from "@solar-icons/react/ssr"
import { User, CreditCard, LogOut } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';

// Gera iniciais a partir do nome
const generateInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

// Props da Navbar
interface NavbarProps {
  /** Função para alternar a visibilidade da sidebar principal da aplicação. */
  onToggleSidebar?: () => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export default function Navbar({ onToggleSidebar, isOpen, setIsOpen }: NavbarProps) {
  const { user } = useUser()
  
  // Estado para o "drawer" de notificações (lógica mantida da Navbar 2)
  const [isNotificationSidebarOpen, setIsNotificationSidebarOpen] = useState(false)

  const toggleNotificationSidebar = () => {
    setIsNotificationSidebarOpen(!isNotificationSidebarOpen)
  }

  const closeNotificationSidebar = () => {
    setIsNotificationSidebarOpen(false)
  }

  // Handlers para o dropdown do usuário (lógica da Navbar 1)
  const handleProfileClick = () => {
      window.location.href = '/profile'; // Exemplo
  };
  const handleSubscriptionsClick = () => {
      window.location.href = '/subscriptions'; // Exemplo
  };
  const handleSignOut = () => {
      console.log('Sign Out'); // Implementar lógica de sign out
  };
  
  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        {/* Efeito de vidro (glassmorphism) aplicado a toda a barra */}
        {/* Estilo baseado na Navbar 1 (border + bg-card/50 + blur) */}
        <div className="absolute inset-0 h-full w-full border-b border-foreground/10 bg-card/50 backdrop-blur-xl"></div>
        
        <div className="relative z-10 flex h-20 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Seção Esquerda: Toggle da Sidebar (mobile) + Logo */}
          <div className="flex items-center gap-2">
            {/* Botão para abrir a Sidebar principal da aplicação (só aparece em mobile/tablet) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label="Abrir menu"
            >
              <MenuDots size={20} />
            </Button>
            
            {/* Logo */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/30 font-semibold"
              onClick={() => setIsOpen(true)}
            >
              <Upload className="w-5 h-5" />
              Novo Arquivo
            </motion.button>
          </div>

          {/* Seção Central (Vazia) */}
          {/* Em um app como Dropbox, aqui entraria a Barra de Busca global */}
          <div className="flex-1 px-4 lg:px-8">
            {/* Ex: <SearchBar /> */}
          </div>

          {/* Seção Direita: Ações */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Botão de Notificações (usa a lógica da Navbar 2) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotificationSidebar}
              className={`relative rounded-lg h-9 w-9 ${
                isNotificationSidebarOpen 
                  ? "bg-muted text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Ver notificações"
            >
              <Bell size={20} />
              {/* Badge de notificação */}
              <div className="absolute -top-0 -right-0 w-3 h-3 rounded-full border-2 border-card bg-red-500"></div>
            </Button>

            {/* Menu de Usuário (Dropdown da Navbar 1) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring`}
                  aria-label="Menu do usuário"
                >
                  {generateInitials(user?.name || 'U')}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  Olá, {user?.name.split(' ')[0] || 'Usuário'}!
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSubscriptionsClick}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscriptions</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

      </header>  

      {/* O componente da sidebar de notificações (drawer) seria renderizado aqui */}
      {/* <NotificationSidebar 
        isOpen={isNotificationSidebarOpen}
        onClose={closeNotificationSidebar}
      /> 
      */}
    </>
  )
}