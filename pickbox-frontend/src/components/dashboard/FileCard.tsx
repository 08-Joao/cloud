'use client';

import { FileEntity } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download, FolderArchive, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useDownloadFile } from "@/lib/hooks/use-file";
import { formatBytes } from "@/lib/utils";

interface FileCardProps {
    file: FileEntity;
}

export function FileCard({ file }: FileCardProps) {
    const { mutate: downloadFile, isPending } = useDownloadFile();

    const handleDownload = () => {
        downloadFile({ fileId: file.id, filename: file.originalName });
    };

    return (
        <Card className="w-full max-w-sm transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium truncate">{file.originalName}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleDownload} disabled={isPending}>
                            <Download className="mr-2 h-4 w-4" />
                            {isPending ? 'Baixando...' : 'Baixar'}
                        </DropdownMenuItem>
                        {/* Outras ações como renomear, mover, excluir... */}
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 pt-0">
                {}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-between">
                <span>{formatBytes(file.size)}</span>
                <span>{new Date(file.createdAt).toLocaleDateString()}</span>
            </CardFooter>
        </Card>
    );
}