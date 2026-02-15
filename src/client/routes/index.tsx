import { createFileRoute, Link } from "@tanstack/react-router";
import { trpc } from "../lib/trpc";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const bookmark = trpc.getBookmark.useQuery({ bookId: 1 });

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="rounded-xl border bg-card text-card-foreground shadow p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Daily Reader</h2>
        <p className="text-sm text-muted-foreground mt-2">
          A quiet place to read the classics, one passage at a time.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          {bookmark.data && (
            <Link
              to="/read/$bookId/$position"
              params={{ bookId: "1", position: String(bookmark.data.position) }}
              className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Resume — Passage #{bookmark.data.position}
            </Link>
          )}
          <Link
            to="/read/$bookId/$position"
            params={{ bookId: "1", position: "1" }}
            className="inline-block rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Start from Beginning
          </Link>
        </div>
      </div>
    </div>
  );
}
