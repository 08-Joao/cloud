'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';

import { useState } from 'react';
import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      }
    }
  }));

  return (
    <NextThemesProvider {...props}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </NextThemesProvider>
  );
}