import { createContext, useContext, useMemo } from "react";
import {
  DeleteAlert,
  type DeleteAlertHandle,
} from "@/components/custom/delete-alert";

const DeleteAlertContext = createContext<DeleteAlertHandle | null>(null);

export function DeleteAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const handle = useMemo(() => DeleteAlert.createHandle(), []);

  return (
    <DeleteAlertContext.Provider value={handle}>
      <DeleteAlert handle={handle} />
      {children}
    </DeleteAlertContext.Provider>
  );
}

export function useDeleteAlertHandler(): DeleteAlertHandle {
  const handle = useContext(DeleteAlertContext);
  if (!handle) {
    throw new Error(
      "useDeleteAlertHandler must be used within DeleteAlertProvider",
    );
  }
  return handle;
}
