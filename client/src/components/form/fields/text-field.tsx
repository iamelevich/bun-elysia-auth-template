import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form-context";

export type TextFieldProps = {
  label: string;
  placeholder?: string;
  description?: string;
} & Omit<
  React.ComponentProps<"input">,
  | "type"
  | "value"
  | "onChange"
  | "onBlur"
  | "aria-invalid"
  | "name"
  | "id"
  | "placeholder"
  | "autoComplete"
>;

export function TextField({
  label,
  placeholder,
  description,
  ...props
}: TextFieldProps) {
  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        {...props}
        id={field.name}
        name={field.name}
        autoComplete="off"
        placeholder={placeholder}
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
