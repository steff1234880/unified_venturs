export function createId() {
  return crypto.randomUUID()
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
