# Adding a New Book

This guide explains how to add a new book to the Daily Reader app. Only one file needs editing: `src/server/seed.sql`.

## Seed file layout

There are two seed files:

- **`src/server/seed.sql`** — The full seed with all books (gitignored, may contain copyrighted translations).
- **`src/server/seed.example.sql`** — A committable subset containing only public-domain texts (The Enchiridion).

`pnpm db:seed` uses `seed.sql` if it exists, otherwise falls back to `seed.example.sql`.

When adding a **public-domain** book, add it to both files. When adding a **copyrighted** translation, add it only to `seed.sql`. If `seed.sql` doesn't exist yet, copy `seed.example.sql` to `seed.sql` first.

## Schema Reference

```sql
books (id, title, author, translator, source_url, work_id)
passages (id, book_id, position, title, content)
```

- `work_id` is a kebab-case slug identifying the underlying work (e.g. `"enchiridion"`, `"tao-te-ching"`). Multiple translations of the same text share a `work_id`.
- `position` is a 1-based integer ordering passages within a book. It must be unique per book.
- `title` on passages is a short label shown in the UI (e.g. `"Chapter 1"`, `"Control and Freedom"`).
- `content` is the full passage text. Use newlines for line breaks and double newlines for paragraph breaks.

## Steps

### 1. Choose the next book ID

Look at the existing `INSERT INTO books` statements and pick the next sequential integer ID.

### 2. Add the book INSERT

Append after the last existing book insert:

```sql
INSERT INTO books (id, title, author, translator, source_url, work_id)
VALUES (<next_id>, '<Title>', '<Author>', '<Translator>', '<source_url>', '<work-id>');
```

### 3. Add passage INSERTs

Append one INSERT per passage, after all existing passage inserts for previous books:

```sql
INSERT INTO passages (book_id, position, title, content)
VALUES (<book_id>, 1, '<Passage Title>', '<Passage content text>');

INSERT INTO passages (book_id, position, title, content)
VALUES (<book_id>, 2, '<Passage Title>', '<Passage content text>');
```

Positions must start at 1 and be contiguous (1, 2, 3, ...).

### 4. SQL escaping

Single quotes in text content must be doubled:

- `don't` becomes `don''t`
- `'the way'` becomes `''the way''`

No other escaping is needed. Do not use parameterized queries in the seed file; it is executed as raw SQL via `db.exec()`.

### 5. Re-seed the database

```sh
pnpm db:seed
```

This drops all tables (including bookmarks) and recreates them from scratch. If there is a separate deployed database (e.g. at `/workspace/daily-reader/daily-reader.db`), re-seed it too:

```sh
DB_PATH=/workspace/daily-reader/daily-reader.db pnpm db:seed
```

### 6. Verify

Start the dev server (`pnpm dev`) and confirm:

- The home page lists the new book
- Clicking into it shows passage 1
- Navigation works through all passages
- Bookmarking works

## Sourcing text content

When adding a book from an online source:

1. Fetch the HTML page
2. Parse/extract the individual chapters or passages
3. Generate the SQL INSERT statements with proper escaping
4. Paste them into `seed.sql`

## No other files need changes

The router, UI components, and reader page are all generic. Adding rows to the seed file is sufficient to make a new book appear everywhere.
