import { type Static, type TObject, Type } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { logLevels } from "./db/log.schema";

function parseEnv<T extends TObject>(
  schema: T,
  env: Record<string, string | undefined>,
): Static<T> {
  const cleaned = Object.fromEntries(
    Object.entries(env).filter(([key]) =>
      Object.keys(schema.properties).includes(key),
    ),
  );
  const converted = Value.Convert(schema, Value.Default(schema, cleaned));
  const isValid = Value.Check(schema, converted);
  if (!isValid) {
    const errors = Value.Errors(schema, converted);
    throw new Error(
      `Invalid environment variables: ${[...errors]
        .map((e) => `${e.path}: ${e.message}`)
        .join(", ")}`,
    );
  }

  return converted;
}

const EnvDTO = Type.Object({
  NODE_ENV: Type.Enum(
    {
      development: "development",
      production: "production",
    },
    { default: "development" },
  ),
  PORT: Type.Number({ default: 3000 }),
  HOSTNAME: Type.String({ default: "localhost" }),
  DB_FILE_NAME: Type.String({ default: "./local.db" }),
  LOG_DB_FILE_NAME: Type.String({ default: "./log.local.db" }),
  LOG_LEVEL: Type.Enum(
    Object.fromEntries(logLevels.map((level) => [level, level])),
    { default: "info" },
  ),
});

export const isProd = process.env.NODE_ENV === "production";
export const env = parseEnv(EnvDTO, process.env);
