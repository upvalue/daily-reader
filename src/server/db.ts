import { type Generated, Kysely, SqliteDialect } from "kysely";
import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface BookTable {
  id: number;
  title: string;
  author: string;
  translator: string;
  source_url: string;
}

export interface PassageTable {
  id: number;
  book_id: number;
  position: number;
  title: string;
  content: string;
}

export interface BookmarkTable {
  id: Generated<number>;
  book_id: number;
  position: number;
  updated_at: string;
}

export interface DB {
  books: BookTable;
  passages: PassageTable;
  bookmarks: BookmarkTable;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbPath = path.join(__dirname, "..", "..", "daily-reader.db");
const dbPath = process.env.DB_PATH ?? defaultDbPath;

const sqliteDb = new Database(dbPath);
sqliteDb.pragma("journal_mode = WAL");
sqliteDb.pragma("foreign_keys = ON");

export const db = new Kysely<DB>({
  dialect: new SqliteDialect({ database: sqliteDb }),
});
