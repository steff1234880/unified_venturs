export function PageLoader() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="size-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent"
          aria-hidden
        />
        <p className="text-body-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
