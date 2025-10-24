'use client'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Letter, Logout, Phone, QuestionCircle, Settings, Shield, User, CheckRead, TrashBinTrash } from '@solar-icons/react/ssr'
import { X } from 'lucide-react'
import Api from '@/services/Api'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface UserSidebarProps {
    isOpen: boolean
    onClose: () => void
}

// Generate initials from name
const generateInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
}

function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
    const { user, logout } = useAuth()

    const router = useRouter()
    const handleLogout = async () => {
        await logout()
        onClose()
    }


    const menuItems = [
        {
            icon: <User size={20} />,
            label: "Meu Perfil",
            action: () => {
                console.log("Navegar para perfil")
                onClose()
            }
        },
        {
            icon: <Settings size={20} />,
            label: "Configurações",
            action: () => {
                console.log("Navegar para configurações")
                onClose()
            }
        },
        {
            icon: <Shield size={20} />,
            label: "Privacidade e Segurança",
            action: () => {
                console.log("Navegar para privacidade")
                onClose()
            }
        },
        {
            icon: <QuestionCircle size={20} />,
            label: "Ajuda e Suporte",
            action: () => {
                console.log("Navegar para ajuda")
                onClose()
            }
        }
    ]

    return (
        <>
            {/* Background overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    onClick={onClose}
                />
            )}

            {/* User Sidebar */}
            <div
                className={`
                    fixed top-0 right-0 h-screen w-[400px] z-[61]
                    transition-all duration-500 ease-in-out
                    bg-card/95 backdrop-blur-xl border-l border-border/20
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-bl from-primary/3 via-accent/3 to-chart-3/3 rounded-l-3xl"></div>

                <div className="relative z-10 h-full flex flex-col p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-foreground">Perfil do Usuário</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-xl h-10 w-10"
                        >
                            <X size={20} />
                        </Button>
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col items-center mb-8 p-6 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/10">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-lg text-primary-foreground font-bold shadow-lg mb-4">
                            {generateInitials(user?.name || 'João Silva')}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{user?.name || 'João Silva'}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Letter size={14} />
                            <span>{user?.email || 'joao@example.com'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone size={14} />
                            <span>{user?.phoneNumber || '(99) 99999-9999'}</span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 space-y-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-transparent hover:bg-secondary/40 hover:border-border/20 text-muted-foreground hover:text-foreground"
                            >
                                <div className="flex-shrink-0 text-current">
                                    {item.icon}
                                </div>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="pt-4 border-t border-border/20">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-transparent hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-800/30 text-red-600 hover:text-red-700 dark:hover:text-red-500"
                        >
                            <Logout size={20} />
                            <span>Sair da Conta</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserSidebar