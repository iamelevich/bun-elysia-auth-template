import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form-context";

export type NumberFieldProps = {
  label: string;
  placeholder?: string;
  description?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
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

export function NumberField({
  label,
  placeholder,
  description,
  step = "0.01",
  min,
  max,
  ...props
}: NumberFieldProps) {
  const field = useFieldContext<string>();
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        {...props}
        id={field.name}
        name={field.name}
        type="number"
        step={step}
        min={min}
        max={max}
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
