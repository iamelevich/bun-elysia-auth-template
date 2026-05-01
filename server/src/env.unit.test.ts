import { describe, expect, it } from "bun:test";
import { EnvDTO, parseEnv } from "./env";

describe("env", () => {
  it("uses defaults when optional env vars are missing", async () => {
    const envs = {
      DB_FILE_NAME: "./tmp/tests/default.db",
      LOG_DB_FILE_NAME: "./tmp/tests/default.log.db",
      BETTER_AUTH_SECRET: "x",
      BETTER_AUTH_URL: "http://localhost:3000",
    };

    const env = parseEnv(EnvDTO, envs);
    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(3000);
    expect(env.HOSTNAME).toBe("localhost");
    expect(env.CLIENT_URL).toBe("http://localhost:5173");
  });

  it("converts PORT to number", async () => {
    const envs = {
      LOG_DB_FILE_NAME: "./tmp/tests/port.log.db",
      PORT: "4321",
      BETTER_AUTH_SECRET: "x",
      BETTER_AUTH_URL: "http://localhost:3000",
    };

    const env = parseEnv(EnvDTO, envs);
    expect(env.PORT).toBe(4321);
  });

  it("throws on invalid LOG_LEVEL", () => {
    const envs = {
      LOG_DB_FILE_NAME: "./tmp/tests/bad.log.db",
      LOG_LEVEL: "invalid-level",
      BETTER_AUTH_SECRET: "x",
      BETTER_AUTH_URL: "http://localhost:3000",
    };

    expect(() => parseEnv(EnvDTO, envs)).toThrow(/LOG_LEVEL/);
  });
});
