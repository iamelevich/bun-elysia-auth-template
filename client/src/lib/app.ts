import type { App } from "@app/server";
import { treaty } from "@elysiajs/eden";

export const app = treaty<App>(window.location.origin, {});
