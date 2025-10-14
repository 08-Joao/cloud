'use client';

import { FolderEntity } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Folder } from "lucide-react";
import { Icons } from "../shared/Icons";

interface FolderCardProps {
    folder: FolderEntity;
}

export function FolderCard({ folder }: FolderCardProps) {
    return (
        <Link href={`/dashboard/${folder.id}`}>
            <Card className="w-full max-w-sm transition-all hover:shadow-lg hover:bg-accent">
                <CardHeader>
                    <CardTitle className="text-sm font-medium truncate flex items-center gap-2">
                        <Icons.folder className="h-5 w-5 text-yellow-500" />
                        {folder.name}
                    </CardTitle>
                </CardHeader>
            </Card>
        </Link>
    );
}