import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { render } from "@testing-library/react";
import React from "react";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

type WrapperProps = {
  queryClient?: QueryClient;
};

export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = makeQueryClient(),
    ...renderOptions
  }: WrapperProps & Omit<RenderOptions, "wrapper"> = {},
): RenderResult & { queryClient: QueryClient } {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
