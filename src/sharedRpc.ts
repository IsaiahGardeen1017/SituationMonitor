export type QuoteSource = 'yahoo'

export type QuoteRecord = {
  ticker: string
  price: number | null
  change: number | null
  changePercent: number | null
  currency: string | null
  marketState: string | null
}

export type TickerGroup = 'ALL' | 'STRATEGIC'

const strategicTickers = ['SPY', 'QQQ', 'DIA', 'VTI', 'VT', 'GSG', 'XLI', 'USO', 'UVXY']

export const tickerGroups: Record<TickerGroup, string[]> = {
  ALL: [...strategicTickers],
  STRATEGIC: strategicTickers,
}

export type TickerInput = {
  group: TickerGroup
  source?: QuoteSource
}

export type RpcSuccess<TData> = {
  result: {
    data: TData
  }
}

export type RpcFailure = {
  error: {
    message: string
  }
}

export type TickerPayload = {
  quotes: QuoteRecord[]
  source: QuoteSource
}
