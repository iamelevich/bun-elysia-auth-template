"use client";

import {
  Icon,
  type IconifyIcon,
  type IconProps,
  loadIcon,
} from "@iconify/react";
import { type JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

export type LazyIconProps = IconProps & {
  fallbackIcon?: JSX.Element;
  toastOnError?: boolean;
  errorMessage?: string | JSX.Element;
};

export const LazyIcon = ({
  icon,
  fallbackIcon,
  toastOnError = true,
  errorMessage,
  ...props
}: LazyIconProps) => {
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState<IconifyIcon | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    if (typeof icon !== "string") {
      setLoaded(icon);
      setLoading(false);
      return;
    }
    loadIcon(icon)
      .then((iconData) => {
        if (!cancelled) setLoaded(iconData);
      })
      .catch((error) => {
        if (!cancelled && toastOnError) {
          toast.error(
            errorMessage ??
              `Failed to load icon ${icon}${error?.message ? `: ${error.message}` : ""}`,
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [icon, errorMessage, toastOnError]);
  if (loading) {
    return <Spinner className={props.className} />;
  }
  if (!loaded) {
    return fallbackIcon;
  }
  return <Icon icon={loaded} {...props} />;
};
