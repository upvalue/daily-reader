import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.join(__dirname, "..", "..", "daily-reader.db");
const dbPath = process.env.DB_PATH ?? defaultDbPath;

const basePath = path.join(__dirname, "seed.base.sql");
const privatePath = path.join(__dirname, "seed.private.sql");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(fs.readFileSync(basePath, "utf-8"));

if (fs.existsSync(privatePath)) {
  db.exec(fs.readFileSync(privatePath, "utf-8"));
}

db.close();

console.log(`Seeded database at ${dbPath}`);
