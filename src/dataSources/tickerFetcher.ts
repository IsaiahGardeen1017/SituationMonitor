export type StockTickerData = {
    ticker: string;
    price: number | null;
    change: number | null;
    changePercent?: number | null;
}

export type TickerGroups = 'ALL' | 'STRATEGIC';

const strategic = ['SPY','QQQ','DIA','VTI','VT','GSG','XLI','USO','UVXY'];
const tickerGroups: Record<TickerGroups, string[]> = {
    'ALL': [strategic].flat(),
    'STRATEGIC': strategic
}

export async function fetchTickerData(group: TickerGroups): Promise<StockTickerData[]> {
    const tickersToGet = tickerGroups[group];
    const url = `/api/quotes?symbols=${encodeURIComponent(tickersToGet.join(','))}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Ticker request failed with status ${response.status}`);
    }

    const body = await response.json() as { quotes?: StockTickerData[] };
    return body.quotes ?? [];
}
