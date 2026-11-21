import type { IncomingMessage, ServerResponse } from 'node:http'

export type ConnectMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: any) => void,
) => void | Promise<void>

export function createApiMiddleware(): ConnectMiddleware

