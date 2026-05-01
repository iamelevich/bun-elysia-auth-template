// Global test setup
import { beforeAll } from "bun:test";
import { seedTestUsers, setupTestDb } from "./test-helpers";

beforeAll(() => {
  // Set up test database
  setupTestDb();
  seedTestUsers();
});
