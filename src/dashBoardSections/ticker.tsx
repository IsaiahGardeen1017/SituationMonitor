import { useEffect, useState, type ReactElement } from 'react'
import { fetchTickerData, StockTickerData, TickerGroups } from '../dataSources/tickerFetcher'

type StockTickerProps = {
    stockGroup: TickerGroups;
}

export default function StockTickerWidget(props: StockTickerProps): ReactElement {
    const [stockData, setStockData] = useState((): StockTickerData[] => []);

    useEffect(() => {
        async function refreshTickerData() {
            try {
                const nextData = await fetchTickerData(props.stockGroup);
                setStockData(nextData);
            } catch (error) {
                console.error('Failed to refresh ticker data', error);
                setStockData([]);
            }
        }

        void refreshTickerData();

        const intervalId = window.setInterval(async () => {
            await refreshTickerData();
        }, 60000);

        return () => {
            window.clearInterval(intervalId)
        }
    }, [props.stockGroup]);

    const stringifiedStocks = stockData.map((sD) => {
        return `${sD.ticker} ${sD.price ?? '--'}`;
    }).join(' ');

    return (
        <div className='flex items-center justify-center h-full'>
            {stringifiedStocks}
        </div>
    )
}
