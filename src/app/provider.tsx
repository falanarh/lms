'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Load Devtools only on client and in development to avoid vendor-chunk issues on server
  const Devtools = useMemo(
    () =>
      process.env.NODE_ENV === 'development'
        ? dynamic(() => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools), {
            ssr: false,
          })
        : null,
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {Devtools ? <Devtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
