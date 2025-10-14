'use client';

import { GetUserDto } from "@/lib/types";
import { Button } from "../ui/button";
import { LogOut, Plus, Upload } from "lucide-react";
import { ThemeToggle } from "../shared/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useSignOut } from "@/lib/hooks/use-auth";

interface DashboardHeaderProps {
    user: GetUserDto;
    onUploadClick: () => void;
    onCreateFolderClick: () => void;
}

export function DashboardHeader({ user, onUploadClick, onCreateFolderClick }: DashboardHeaderProps) {
    const { mutate: signOut, isPending } = useSignOut();

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const handleSignOut = () => {
        signOut();
    }

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="flex-1 flex items-center gap-4">
                    <h1 className="font-bold text-lg">Meus Arquivos</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button onClick={onCreateFolderClick} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Pasta
                    </Button>
                    <Button onClick={onUploadClick} size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>

                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Avatar>
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} disabled={isPending}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{isPending ? 'Saindo...' : 'Sair'}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}