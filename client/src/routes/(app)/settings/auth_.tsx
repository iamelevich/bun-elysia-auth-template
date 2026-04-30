import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAppForm } from "@/components/form/form-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ensureSettings,
  useSettingsBatchMutation,
  useSettingsQuery,
} from "@/queries/settings";

export const Route = createFileRoute("/(app)/settings/auth_")({
  loader: ({ context: { queryClient } }) => ensureSettings(queryClient),
  staticData: { breadcrumb: "Auth" },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: settings } = useSettingsQuery();
  const mutation = useSettingsBatchMutation();

  const disableRegistration =
    settings?.find((s) => s.key === "auth.disable_registration")?.value ===
    "true";

  const form = useAppForm({
    defaultValues: {
      disableRegistration,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync([
        {
          key: "auth.disable_registration",
          value: String(value.disableRegistration),
        },
      ]);
      toast.success("Auth settings saved");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth settings</CardTitle>
        <CardDescription>Configure authentication behaviour</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.AppField name="disableRegistration">
            {(field) => (
              <field.CheckboxField
                label="Disable registration for new users"
                description="If enabled, new users will not be able to register."
              />
            )}
          </form.AppField>
          <div className="mt-6">
            <form.AppForm>
              <form.SubmitButton label="Save" />
            </form.AppForm>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
