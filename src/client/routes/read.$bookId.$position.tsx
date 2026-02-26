import { useEffect, useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { trpc } from "../lib/trpc";
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck } from "lucide-react";

export const Route = createFileRoute("/read/$bookId/$position")({
  component: PassageReader,
});

function PassageReader() {
  const { bookId, position } = Route.useParams();
  const navigate = useNavigate();

  const bookIdNum = Number(bookId);
  const positionNum = Number(position);

  const passage = trpc.getPassage.useQuery({ bookId: bookIdNum, position: positionNum });
  const bookInfo = trpc.getBookInfo.useQuery({ bookId: bookIdNum });

  const bookmark = trpc.getBookmark.useQuery({ bookId: bookIdNum });
  const utils = trpc.useUtils();
  const saveBookmark = trpc.saveBookmark.useMutation({
    onSuccess: () => utils.getBookmark.invalidate({ bookId: bookIdNum }),
  });

  const passageCount = bookInfo.data?.passageCount ?? 0;
  const isBookmarked = bookmark.data?.position === positionNum;
  const hasPrev = positionNum > 1;
  const hasNext = positionNum < passageCount;

  const goTo = useCallback(
    (pos: number) => {
      navigate({ to: "/read/$bookId/$position", params: { bookId, position: String(pos) } });
    },
    [navigate, bookId],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && hasPrev) goTo(positionNum - 1);
      if (e.key === "ArrowRight" && hasNext) goTo(positionNum + 1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goTo, hasPrev, hasNext, positionNum]);

  const data = passage.data;

  return (
    <div className="min-h-screen flex flex-col pb-16">
      {/* Content */}
      <main className="flex-1 px-4 py-8">
        <div
          key={`${bookId}-${position}`}
          className={`max-w-2xl mx-auto transition-opacity duration-300 ${data ? "opacity-100" : "opacity-0"}`}
        >
          {data && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {data.bookTitle} — {data.author} — Passage #{positionNum}
              </p>

              <div className="whitespace-pre-line leading-relaxed">
                {data.content}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Fixed bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-background px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => goTo(positionNum - 1)}
            disabled={!hasPrev}
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium border border-border bg-card hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={() => saveBookmark.mutate({ bookId: bookIdNum, position: positionNum })}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {positionNum} / {passageCount || "..."}
          </button>
          <button
            onClick={() => goTo(positionNum + 1)}
            disabled={!hasNext}
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium border border-border bg-card hover:bg-accent disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </div>
  );
}
