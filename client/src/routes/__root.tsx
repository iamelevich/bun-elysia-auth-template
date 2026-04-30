import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "sonner";
import { DeleteAlertProvider } from "@/components/providers/delete-alert-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface RootRouteContext {
  queryClient: QueryClient;
}

const RootLayout = () => (
  <>
    <TooltipProvider>
      <DeleteAlertProvider>
        <Outlet />
        <Toaster />
        <TanStackRouterDevtools />
      </DeleteAlertProvider>
    </TooltipProvider>
  </>
);

export const Route = createRootRouteWithContext<RootRouteContext>()({
  component: RootLayout,
});
