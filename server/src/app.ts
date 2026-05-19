import cors from "@elysiajs/cors";
import openapi, { fromTypes } from "@elysiajs/openapi";
import staticPlugin from "@elysiajs/static";
import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { version } from "../../package.json";
import { api } from "./api";
import { isProd } from "./env";
import { OpenAPI } from "./lib/openapi";
import { authMiddleware } from "./middleware/auth";
import { loggerService } from "./services/logger";

const indexHTML = Bun.file("./client/index.html");

const app = new Elysia({
  serve: {
    routes: { "/api/*": false, "/auth/*": false },
  },
})
  .onError(({ error, code, path }) => {
    // Hack to make SPA fallback to index.html
    if (
      isProd &&
      code === "NOT_FOUND" &&
      !path.startsWith("/api/") &&
      !path.startsWith("/assets") &&
      !path.startsWith("/auth/")
    ) {
      return indexHTML;
    }
    // If the error is a not found error, don't log it
    if (code === "NOT_FOUND") return;
    loggerService.error("Unhandled error", {
      code: code ?? "UNKNOWN",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  })
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: {
          title: "Super App Server API",
          version,
        },
        tags: [],
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
      references: fromTypes(
        process.env.NODE_ENV === "production" ? "index.d.ts" : "index.ts",
      ),
    }),
  )
  .use(logger())
  .use(authMiddleware)
  .use(api);

if (isProd) {
  console.log("Serving static files from client directory");
  app
    .use(
      await staticPlugin({
        assets: "client/assets",
        prefix: "/assets",
        alwaysStatic: true,
      }),
    )
    .get("/", async () => indexHTML);
} else {
  console.log("Not in production, not serving static files");
}

export { app };
