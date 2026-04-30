import Elysia from "elysia";
import { logsRoutes } from "./routes/logs";
import { settingsRoutes } from "./routes/settings";

export const api = new Elysia({
  prefix: "/api",
})
  .use(settingsRoutes)
  .use(logsRoutes);
