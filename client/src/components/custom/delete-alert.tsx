import { IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  type AlertDialogActions,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Spinner } from "../ui/spinner";

type DeleteAlertHandleStore = {
  title?: string;
  description?: string;
  deleteFn: () => Promise<void>;
};

DeleteAlert.createHandle = AlertDialog.createHandle<DeleteAlertHandleStore>;
export type DeleteAlertHandle = ReturnType<typeof DeleteAlert.createHandle>;

type DeleteAlertProps = {
  handle: DeleteAlertHandle;
};

export function DeleteAlert({ handle }: DeleteAlertProps) {
  const actionsRef = useRef<AlertDialogActions | null>(null);
  return (
    <AlertDialog actionsRef={actionsRef} handle={handle}>
      {({ payload }) => (
        <DeleteAlertInner
          title={payload?.title}
          description={payload?.description}
          deleteFn={payload?.deleteFn ?? (() => Promise.resolve())}
          actionsRef={actionsRef}
        />
      )}
    </AlertDialog>
  );
}

function DeleteAlertInner({
  title,
  description,
  deleteFn,
  actionsRef,
}: DeleteAlertHandleStore & {
  actionsRef: React.RefObject<AlertDialogActions | null>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <AlertDialogContent size="sm">
      <AlertDialogHeader>
        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
          <IconTrash />
        </AlertDialogMedia>
        <AlertDialogTitle>{title ?? "Delete this item?"}</AlertDialogTitle>
        <AlertDialogDescription>
          {description ??
            "This will permanently delete this item. Are you sure you want to continue?"}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          onClick={() => {
            setIsDeleting(true);
            deleteFn()
              .then(() => {
                actionsRef.current?.close();
              })
              .finally(() => {
                setIsDeleting(false);
              });
          }}
        >
          {isDeleting && <Spinner />}
          {isDeleting ? "Deleting..." : "Delete"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
