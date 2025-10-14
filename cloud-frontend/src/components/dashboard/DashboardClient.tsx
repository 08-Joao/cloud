'use client';

import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { useState } from "react";
import { UploadModal } from "./UploadModal";
import { GetUserDto } from "@/lib/types";
import { DashboardHeader } from "./DashboardHeader";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import Link from "next/link";
import { Slash } from "lucide-react";
import { useFolderContent } from "@/lib/hooks/use-folder";
import { CreateFolderModal } from "./CreateModal";

interface DashboardClientProps {
    initialFolderId: string;
    user: GetUserDto;
}

export function DashboardClient({ initialFolderId, user }: DashboardClientProps) {
    const { data: folderContent, isLoading, isError } = useFolderContent(initialFolderId);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isCreateFolderModalOpen, setCreateFolderModalOpen] = useState(false);

    if (isError) {
        return <div className="text-center text-red-500 mt-10">Erro ao carregar os arquivos. Tente novamente mais tarde.</div>
    }

    if (isLoading || !folderContent) { // Adicionado !folderContent por segurança
        return <div>Carregando...</div>;
    }

    return (
        <>
            <DashboardHeader 
                user={user} 
                onUploadClick={() => setUploadModalOpen(true)}
                onCreateFolderClick={() => setCreateFolderModalOpen(true)}
            />
            <main className="container py-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        {/* CORREÇÃO AQUI */}
                        {(folderContent?.path || []).map((p, index) => (
                            <BreadcrumbItem key={p.id}>
                                <BreadcrumbLink asChild>
                                    <Link href={`/dashboard/${p.id}`}>{p.name}</Link>
                                </BreadcrumbLink>
                                {/* Aqui precisamos ser defensivos também */}
                                {index < (folderContent.path || []).length - 1 && <BreadcrumbSeparator><Slash /></BreadcrumbSeparator>}
                            </BreadcrumbItem>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>

                {folderContent && (
                    <>
                        {/* CORREÇÃO AQUI */}
                        {((folderContent.subFolders || []).length > 0 || (folderContent.files || []).length > 0) ? (
                            <>
                                {/* CORREÇÃO AQUI */}
                                {(folderContent.subFolders || []).length > 0 && (
                                    <section className="mt-8">
                                        <h2 className="text-xl font-semibold mb-4">Pastas</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {/* CORREÇÃO AQUI */}
                                            {(folderContent.subFolders || []).map(folder => <FolderCard key={folder.id} folder={folder} />)}
                                        </div>
                                    </section>
                                )}
                                {/* CORREÇÃO AQUI */}
                                {(folderContent.files || []).length > 0 && (
                                    <section className="mt-8">
                                        <h2 className="text-xl font-semibold mb-4">Arquivos</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                            {/* CORREÇÃO AQUI */}
                                            {(folderContent.files || []).map(file => <FileCard key={file.id} file={file} />)}
                                        </div>
                                    </section>
                                )}
                            </>
                        ) : (
                            <div className="mt-16 text-center text-muted-foreground">
                                <p>Esta pasta está vazia.</p>
                                <p>Clique em "Upload" para adicionar arquivos.</p>
                            </div>
                        )}
                    </>
                )}
            </main>

            <UploadModal 
                isOpen={isUploadModalOpen} 
                onOpenChange={setUploadModalOpen}
                folderId={initialFolderId}
            />
            <CreateFolderModal
                isOpen={isCreateFolderModalOpen}
                onOpenChange={setCreateFolderModalOpen}
                parentId={initialFolderId}
            />
        </>
    );
}