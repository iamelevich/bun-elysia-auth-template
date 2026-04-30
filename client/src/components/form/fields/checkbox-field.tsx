import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form-context";

export type CheckboxFieldProps = {
  label: string;
};

export function CheckboxField({ label }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  return (
    <Field orientation="horizontal">
      <Input
        type="checkbox"
        id={`${field.name}-checkbox`}
        checked={field.state.value ?? true}
        onChange={(e) => field.handleChange(e.target.checked)}
        className="h-4 w-4"
      />
      <FieldLabel htmlFor={`${field.name}-checkbox`}>{label}</FieldLabel>
      {field.state.meta.errors && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  );
}
