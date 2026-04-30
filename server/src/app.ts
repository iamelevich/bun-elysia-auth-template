import cors from "@elysiajs/cors";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { version } from "../../package.json";
import { api } from "./api";
import { isProd } from "./env";
import { authMiddleware } from "./middleware/auth";

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: {
          title: "Super App Server API",
          version,
        },
        tags: [],
      },
      references: fromTypes(
        process.env.NODE_ENV === "production"
          ? "../dist/index.d.ts"
          : "src/index.ts",
      ),
    }),
  )
  .use(logger())
  .use(authMiddleware)
  .use(api);

if (isProd) {
  app.use(
    staticPlugin({
      assets: import.meta.dir + "/client",
      prefix: "/",
      indexHTML: true,
    }),
  );
}

export { app };
