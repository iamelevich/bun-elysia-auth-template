import cors from "@elysiajs/cors";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { staticPlugin } from "@elysiajs/static";
import { logger } from "@tqman/nice-logger";
import { Elysia } from "elysia";
import { version } from "../../package.json";
import { api } from "./api";
import { isProd } from "./env";

const app = new Elysia()
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: {
          title: "Budzetto Server API",
          description:
            "API for the Budzetto server that powers the Budzetto web app that lets you manage your finances on your own server.",
          version,
        },
        tags: [
          { name: "Accounts", description: "Account management endpoints" },
          { name: "Balances", description: "Balance management endpoints" },
          { name: "Categories", description: "Category management endpoints" },
          { name: "Currencies", description: "Currency management endpoints" },
          { name: "Payees", description: "Payee management endpoints" },
          {
            name: "Transactions",
            description: "Transaction management endpoints",
          },
        ],
      },
      references: fromTypes(
        process.env.NODE_ENV === "production"
          ? "../dist/index.d.ts"
          : "src/index.ts",
      ),
    }),
  )
  .use(logger())
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
