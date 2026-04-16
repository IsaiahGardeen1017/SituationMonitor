import type {
  QuoteRecord,
  RpcFailure,
  RpcSuccess,
  TickerGroup,
  TickerInput,
  TickerPayload,
} from '../sharedRpc'

export type StockTickerData = Pick<QuoteRecord, 'ticker' | 'price' | 'change' | 'changePercent'>

export type TickerGroups = TickerGroup

export async function fetchTickerData(group: TickerGroups): Promise<StockTickerData[]> {
  const input: TickerInput = { group }
  const response = await fetch('/trpc/ticker.get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(`Ticker request failed with status ${response.status}`)
  }

  const body = (await response.json()) as RpcSuccess<TickerPayload> | RpcFailure

  if ('error' in body) {
    throw new Error(body.error.message)
  }

  return body.result.data.quotes
}
