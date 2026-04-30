import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFieldContext } from "../form-context";

export type CheckboxFieldProps = {
  label: string;
  description?: string;
};

export function CheckboxField({ label, description }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  return (
    <Field>
      <div className="flex items-center gap-2">
        <Input
          type="checkbox"
          id={`${field.name}-checkbox`}
          checked={field.state.value ?? true}
          onChange={(e) => field.handleChange(e.target.checked)}
          aria-description="test"
          className="h-4 w-4"
        />
        <FieldLabel htmlFor={`${field.name}-checkbox`}>{label}</FieldLabel>
      </div>
      {field.state.meta.errors && (
        <FieldError errors={field.state.meta.errors} />
      )}
      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}
