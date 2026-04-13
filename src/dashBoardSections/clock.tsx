import { useEffect, useState, type ReactElement } from 'react'

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export default function ClockWidget(): ReactElement {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className='flex items-center justify-center h-full'>
      <time className="font-['Audiowide']" dateTime={now.toISOString()}>
        {formatTime(now)}
      </time>
    </div>
  )
}
