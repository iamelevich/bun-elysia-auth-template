import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form-context";

export type DateFieldProps = {
  label: string;
  description?: string;
} & Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange" | "onBlur" | "aria-invalid" | "name" | "id"
>;

export function DateField({ label, description, ...props }: DateFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        {...props}
        id={field.name}
        name={field.name}
        type="date"
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        aria-invalid={!field.state.meta.isValid}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.errors && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  );
}

/**
 * Convert a timestamp to an input value.
 * @param timestamp - The timestamp to convert to an input value.
 * @returns The input value.
 */
export function dateToInputValue(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toISOString().slice(0, 10);
}

/**
 * Convert an input value to a timestamp.
 * @param value - The input value to convert to a timestamp.
 * @returns The timestamp.
 */
export function inputValueToTimestamp(value: string): number {
  const [y, m, d] = value.split("-").map(Number);
  return Math.floor(new Date(y, m - 1, d).getTime() / 1000);
}
