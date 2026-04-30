import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { SubmitButton } from "./components/submit-button";
import { CheckboxField } from "./fields/checkbox-field";
import { DateField } from "./fields/date-field";
import { IconField } from "./fields/icon-field";
import { NumberField } from "./fields/number-field";
import { TextField } from "./fields/text-field";
import { TextareaField } from "./fields/textarea-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll learn more about these options later
  fieldComponents: {
    TextField,
    IconField,
    TextareaField,
    CheckboxField,
    NumberField,
    DateField,
  },
  formComponents: {
    SubmitButton,
  },
});
