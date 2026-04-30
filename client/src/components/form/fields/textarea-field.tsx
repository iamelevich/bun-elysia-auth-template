import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "../form-context";

export type TextareaFieldProps = {
  label: string;
  description?: string;
  disabled?: boolean;
} & Omit<
  React.ComponentProps<"textarea">,
  "name" | "value" | "onChange" | "onBlur" | "aria-invalid"
>;

export function TextareaField({
  label,
  description,
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        {...props}
        name={field.name}
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
