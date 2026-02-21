import { createFileRoute, Link } from "@tanstack/react-router";
import { trpc } from "../lib/trpc";

export const Route = createFileRoute("/")({
  component: Index,
});

function BookCard({ book }: { book: { id: number; title: string; author: string; translator: string; work_id: string } }) {
  const bookmark = trpc.getBookmark.useQuery({ bookId: book.id });

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6 w-full max-w-md text-left">
      <h3 className="text-lg font-semibold tracking-tight">{book.title}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {book.author} &middot; translated by {book.translator}
      </p>
      <div className="flex gap-2 mt-4">
        {bookmark.data && (
          <Link
            to="/read/$bookId/$position"
            params={{ bookId: String(book.id), position: String(bookmark.data.position) }}
            className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            Resume — #{bookmark.data.position}
          </Link>
        )}
        <Link
          to="/read/$bookId/$position"
          params={{ bookId: String(book.id), position: "1" }}
          className="inline-block rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          Start from Beginning
        </Link>
      </div>
    </div>
  );
}

function Index() {
  const books = trpc.listBooks.useQuery();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6 py-12 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Daily Reader</h2>
          <p className="text-sm text-muted-foreground mt-2">
            A quiet place to read the classics, one passage at a time.
          </p>
        </div>
        {books.data?.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
