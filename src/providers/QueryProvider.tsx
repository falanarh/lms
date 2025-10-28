"use client"; 

import { ReactNode } from "react";
import {  QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/queryClient";

type ProvidersProps = {
  children: ReactNode;
}

export default function QueryProvider({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {
        process.env.NODE_ENV == "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )
      }
   
    </QueryClientProvider>
  );
}
