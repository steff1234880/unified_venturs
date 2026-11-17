type CollectionStatusProps = {
  loading?: boolean
  error?: string | null
}

export function CollectionStatus({ loading, error }: CollectionStatusProps) {
  if (loading) {
    return (
      <p className="rounded-xl border border-border bg-surface-elevated p-6 text-body-sm text-muted-foreground">
        Loading...
      </p>
    )
  }

  if (error) {
    return (
      <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-body-sm text-destructive" role="alert">
        {error}
      </p>
    )
  }

  return null
}
