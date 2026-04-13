import express, { type Request, type Response } from 'express'

type QuoteSource = 'yahoo'

type QuoteRecord = {
  ticker: string
  price: number | null
  change: number | null
  changePercent: number | null
  currency: string | null
  marketState: string | null
}

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

app.get('/api/health', (_request: Request, response: Response) => {
  response.json({ ok: true })
})

app.get('/api/quotes', async (request: Request, response: Response) => {
  const source = getQuoteSource(request.query.source)
  const symbols = parseSymbols(request.query.symbols)

  if (!source) {
    response.status(400).json({
      error: `Unsupported quote source: ${String(request.query.source)}`,
    })
    return
  }

  if (symbols.length === 0) {
    response.status(400).json({
      error: 'Query parameter "symbols" is required.',
    })
    return
  }

  try {
    const quotes = await quoteProviders[source](symbols)
    response.json({
      quotes,
      source,
    })
  } catch (error) {
    console.error('Quote proxy failed', error)
    response.status(502).json({
      error: 'Failed to fetch quotes from upstream provider.',
    })
  }
})

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})

function getQuoteSource(sourceQuery: unknown): QuoteSource | null {
  if (sourceQuery === undefined) {
    return 'yahoo'
  }

  if (sourceQuery === 'yahoo') {
    return sourceQuery
  }

  return null
}

function parseSymbols(symbolsQuery: unknown): string[] {
  if (typeof symbolsQuery !== 'string') {
    return []
  }

  return symbolsQuery
    .split(',')
    .map((symbol) => symbol.trim().toUpperCase())
    .filter(Boolean)
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
