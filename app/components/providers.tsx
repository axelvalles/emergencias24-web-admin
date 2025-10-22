import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          {children}
          <Toaster />
        </NuqsAdapter>
      </QueryClientProvider>
    </>
  );
};
