import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useFormContext } from "../form-context";

export type SubmitButtonProps = Omit<
  Parameters<typeof Button>[0],
  "type" | "disabled" | "onClick"
> & {
  label: string;
};

export function SubmitButton({ label, ...props }: SubmitButtonProps) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button
          type="submit"
          onClick={() => form.handleSubmit()}
          disabled={isSubmitting}
          {...props}
        >
          {isSubmitting ? <Spinner /> : null}
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}
