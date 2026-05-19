import pc from "picocolors";

import { app } from "./app";
import { env } from "./env";

const ELYSIA_VERSION = import.meta.require("elysia/package.json").version;

const startTime = performance.now();

// clear screen
// process.stdout.write("\x1Bc\n");

app.listen(
  {
    port: env.PORT,
    hostname: env.HOSTNAME,
  },
  (server) => {
    const duration = performance.now() - startTime;

    console.log(
      `🦊 ${pc.green(`${pc.bold("Elysia")} v${ELYSIA_VERSION}`)} ${pc.gray(
        "started in",
      )} ${pc.bold(duration.toFixed(2))} ms\n`,
    );
    console.log(
      `${pc.green(" ➜ ")} ${pc.bold("Server")}:   ${pc.cyan(
        String(server.url),
      )}`,
    );
    console.log(
      `${pc.green(" ➜ ")} ${pc.bold("Database")}: ${pc.cyan(env.DB_FILE_NAME)}`,
    );
    console.log(
      `${pc.green(" ➜ ")} ${pc.bold("Log Database")}: ${pc.cyan(env.LOG_DB_FILE_NAME)}`,
    );
    console.log(
      `${pc.green(" ➜ ")} ${pc.bold("Log Level")}: ${pc.cyan(env.LOG_LEVEL)}`,
    );
    console.log(
      `${pc.green(" ➜ ")} ${pc.bold("NODE_ENV")}: ${pc.cyan(env.NODE_ENV)}`,
      "\n",
    );
  },
);
