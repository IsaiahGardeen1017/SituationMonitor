import express, { type Request, type Response } from 'express'
import {
  tickerGroups,
  type QuoteRecord,
  type QuoteSource,
  type RpcFailure,
  type RpcSuccess,
  type TickerInput,
  type TickerPayload,
} from '../src/sharedRpc'

type YahooQuote = {
  currency?: string
  marketState?: string
  regularMarketChange?: number
  regularMarketChangePercent?: number
  regularMarketPrice?: number
  symbol?: string
}

type YahooQuoteResponse = {
  quoteResponse?: {
    result?: YahooQuote[]
  }
}

const app = express()
const port = Number(process.env.PORT ?? 3001)

const quoteProviders: Record<QuoteSource, (symbols: string[]) => Promise<QuoteRecord[]>> = {
  yahoo: fetchYahooQuotes,
}

app.use(express.json())

app.get('/api/health', (_request: Request, response: Response) => {
  response.json({ ok: true })
})

app.post('/trpc/ticker.get', async (request: Request, response: Response) => {
  const input = request.body as TickerInput | undefined

  if (!input || !isTickerInput(input)) {
    sendTrpcError(response, 'Invalid input. Expected { group: "ALL" | "STRATEGIC" }.', 400)
    return
  }

  const source = input.source ?? 'yahoo'
  const symbols = tickerGroups[input.group]

  try {
    const quotes = await quoteProviders[source](symbols)
    const payload: TickerPayload = { quotes, source }
    const success: RpcSuccess<TickerPayload> = {
      result: {
        data: payload,
      },
    }

    response.json(success)
  } catch (error) {
    console.error('Quote RPC failed', error)
    sendTrpcError(response, 'Failed to fetch quotes from upstream provider.', 502)
  }
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})

function sendTrpcError(response: Response, message: string, statusCode: number): void {
  const failure: RpcFailure = {
    error: {
      message,
    },
  }

  response.status(statusCode).json(failure)
}

function isTickerInput(input: TickerInput): input is TickerInput {
  return input.group in tickerGroups
}

async function fetchYahooQuotes(symbols: string[]): Promise<QuoteRecord[]> {
  const url = new URL('https://query1.finance.yahoo.com/v7/finance/quote')
  url.searchParams.set('symbols', symbols.join(','))

  const upstreamResponse = await fetch(url, {
    headers: {
      'User-Agent': 'SituationMonitor/1.0',
    },
  })

  if (!upstreamResponse.ok) {
    throw new Error(`Yahoo request failed with status ${upstreamResponse.status}`)
  }

  const payload = (await upstreamResponse.json()) as YahooQuoteResponse
  const results = payload.quoteResponse?.result

  if (!Array.isArray(results)) {
    throw new Error('Yahoo response was missing quote data')
  }

  return results.map((quote) => ({
    ticker: quote.symbol ?? 'UNKNOWN',
    price: quote.regularMarketPrice ?? null,
    change: quote.regularMarketChange ?? null,
    changePercent: quote.regularMarketChangePercent ?? null,
    currency: quote.currency ?? null,
    marketState: quote.marketState ?? null,
  }))
}
