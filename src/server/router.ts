import { z } from "zod";
import { router, publicProcedure } from "./trpc.js";
import { db } from "./db.js";

export const appRouter = router({
  health: publicProcedure.query(() => ({
    status: "ok" as const,
    timestamp: new Date().toISOString(),
  })),

  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => {
      const name = input?.name ?? "World";
      return { greeting: `Hello, ${name}!` };
    }),

  getPassage: publicProcedure
    .input(z.object({ bookId: z.number(), position: z.number() }))
    .query(async ({ input }) => {
      const row = await db
        .selectFrom("passages")
        .innerJoin("books", "books.id", "passages.book_id")
        .select([
          "passages.id",
          "passages.position",
          "passages.title",
          "passages.content",
          "books.title as bookTitle",
          "books.author",
          "books.translator",
        ])
        .where("passages.book_id", "=", input.bookId)
        .where("passages.position", "=", input.position)
        .executeTakeFirst();

      if (!row) {
        throw new Error(`Passage not found: book ${input.bookId}, position ${input.position}`);
      }

      return row;
    }),

  getBookInfo: publicProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      const book = await db
        .selectFrom("books")
        .selectAll()
        .where("id", "=", input.bookId)
        .executeTakeFirst();

      if (!book) {
        throw new Error(`Book not found: ${input.bookId}`);
      }

      const countResult = await db
        .selectFrom("passages")
        .select(db.fn.countAll().as("count"))
        .where("book_id", "=", input.bookId)
        .executeTakeFirstOrThrow();

      return {
        ...book,
        passageCount: Number(countResult.count),
      };
    }),

  getBookmark: publicProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      return db
        .selectFrom("bookmarks")
        .selectAll()
        .where("book_id", "=", input.bookId)
        .executeTakeFirst() ?? null;
    }),

  saveBookmark: publicProcedure
    .input(z.object({ bookId: z.number(), position: z.number() }))
    .mutation(async ({ input }) => {
      const existing = await db
        .selectFrom("bookmarks")
        .select("id")
        .where("book_id", "=", input.bookId)
        .executeTakeFirst();

      if (existing) {
        await db
          .updateTable("bookmarks")
          .set({ position: input.position, updated_at: new Date().toISOString() })
          .where("id", "=", existing.id)
          .execute();
      } else {
        await db
          .insertInto("bookmarks")
          .values({ book_id: input.bookId, position: input.position, updated_at: new Date().toISOString() })
          .execute();
      }

      return { ok: true };
    }),

  listPassages: publicProcedure
    .input(z.object({ bookId: z.number() }))
    .query(async ({ input }) => {
      return db
        .selectFrom("passages")
        .select(["id", "position", "title"])
        .where("book_id", "=", input.bookId)
        .orderBy("position")
        .execute();
    }),
});

export type AppRouter = typeof appRouter;
