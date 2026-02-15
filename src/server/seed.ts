import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.join(__dirname, "..", "..", "daily-reader.db");
const dbPath = process.env.DB_PATH ?? defaultDbPath;
const sqlPath = path.join(__dirname, "seed.sql");

const sql = fs.readFileSync(sqlPath, "utf-8");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(sql);
db.close();

console.log(`Seeded database at ${dbPath}`);
