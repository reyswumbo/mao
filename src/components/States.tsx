import type { ReactNode } from "react";

/** Placeholder kartu saat data belum termuat. */
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-xl2 border border-line bg-surface ${className}`}>
      <div className="aspect-[2/3] w-full animate-pulse bg-raised" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-4/5 animate-pulse rounded bg-raised" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-raised" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6 xl:grid-cols-7">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  children,
}: {
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20 text-center animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-raised text-2xl">
        😕
      </div>
      <p className="max-w-sm text-sm text-ink2">{message}</p>
      {children && <div className="mt-2 flex gap-3">{children}</div>}
    </div>
  );
}