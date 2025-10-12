import { Skeleton } from "@/components/ui/skeleton";


export default function DashboardLoading() {
  return (
    <div>
        {/* Skeleton do Header */}
        <header className="sticky top-0 z-10 w-full border-b bg-background/95">
            <div className="container flex h-14 items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
        </header>

        {/* Skeleton do Conteúdo */}
        <main className="container py-8">
            <Skeleton className="h-6 w-1/3 mb-8" /> {/* Breadcrumb */}
            
            <h2 className="text-xl font-semibold mb-4">
                <Skeleton className="h-7 w-24" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>

            <h2 className="text-xl font-semibold my-4 mt-8">
                <Skeleton className="h-7 w-24" />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                     <div key={i} className="border rounded-lg p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex justify-center pt-2">
                            <Skeleton className="h-12 w-12" />
                        </div>
                        <div className="flex justify-between pt-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </main>
    </div>
  );
}