import { Icon } from "@iconify/react";
import { IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxStatus,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";
import { useFieldContext } from "../form-context";

export type IconFieldProps = {
  label: string;
  description?: string;
};

type IconifySearchResult = {
  total: number;
  icons: string[];
};

export function IconField({ label, description }: IconFieldProps) {
  const limit = 50;
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  const trimmedSearchValue = searchValue.trim();

  const {
    data: icons = [],
    isLoading,
    error,
    isPending,
  } = useQuery({
    queryKey: ["iconify-search", searchValue, limit],
    queryFn: async ({ signal }): Promise<string[]> => {
      const response = await fetch(
        `https://api.iconify.design/search?query=${encodeURIComponent(searchValue)}&limit=50`,
        { signal },
      );
      const data = (await response.json()) as IconifySearchResult;
      return data.icons;
    },
    enabled: trimmedSearchValue.length >= 2,
  });

  const items = useMemo(() => {
    if (!selectedValue || icons.some((icon) => icon === selectedValue)) {
      return icons;
    }
    return [...icons, selectedValue];
  }, [icons, selectedValue]);

  function getStatus() {
    if (isLoading) {
      return (
        <>
          {" "}
          <Spinner /> Searching...
        </>
      );
    }
    if (isPending) {
      return "Need to enter at least 2 characters";
    }
    if (error) {
      return error.message;
    }
    if (trimmedSearchValue === "") {
      return selectedValue ? null : "Start typing to search icons...";
    }
    if (icons.length === 0) {
      return `No matches for "${trimmedSearchValue}".`;
    }
    return null;
  }

  function getEmptyMessage() {
    if (
      trimmedSearchValue === "" ||
      isPending ||
      isLoading ||
      icons.length > 0 ||
      error
    ) {
      return null;
    }
    return "Try a different search query.";
  }

  // The `Field` infers that it should have a `value` type of `string`
  const field = useFieldContext<string>();
  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Combobox
        name={field.name}
        value={field.state.value}
        items={items}
        filter={null}
        onValueChange={(nextSelectedValue) => {
          field.handleChange(nextSelectedValue ?? "");
          setSelectedValue(nextSelectedValue);
          setSearchValue("");
        }}
        onInputValueChange={(nextSearchValue) => {
          setSearchValue(nextSearchValue);
        }}
      >
        <ComboboxTrigger
          render={
            <Button
              variant="outline"
              className="w-full font-normal"
              aria-invalid={!field.state.meta.isValid}
            >
              {isLoading ? (
                <Spinner />
              ) : field.state.value ? (
                <Icon icon={field.state.value} />
              ) : (
                <IconSearch />
              )}
              <ComboboxValue />
            </Button>
          }
        />

        <ComboboxContent>
          <ComboboxInput placeholder="Search icons..." showTrigger={false} />
          <ComboboxStatus>{getStatus()}</ComboboxStatus>
          <ComboboxEmpty>{getEmptyMessage()}</ComboboxEmpty>
          <ComboboxList>
            {(icon: string) => (
              <ComboboxItem key={icon} value={icon}>
                <Item size="xs" className="p-0">
                  <ItemMedia>
                    <Icon icon={icon} className="size-5" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="whitespace-nowrap">{icon}</ItemTitle>
                  </ItemContent>
                </Item>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {description && <FieldDescription>{description}</FieldDescription>}
      {field.state.meta.errors && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  );
}
