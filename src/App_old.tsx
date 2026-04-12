import type { ReactElement } from 'react'
import {
  LayoutRoot,
  Pane,
  Split,
} from './layout/DashboardLayout'

function App(): ReactElement {
  return (
    <LayoutRoot overflow="scroll">
      <Split direction="horizontal" growWeight={1}>
        <Pane
          minWidth={240}
          minHeight={780}
          growWeight={0}
          className="bg-slate-925"
        >
          <nav className="flex h-full flex-col gap-3 bg-slate-900 px-3 py-4">
            <SidebarSection
              title="Overview"
              items={['Mission Control', 'Incidents', 'Health Checks']}
            />
            <SidebarSection
              title="Operations"
              items={['Deployments', 'Workers', 'Queues', 'Schedules']}
            />
            <SidebarSection
              title="Data"
              items={['Streams', 'Storage', 'Audit Trail']}
            />
          </nav>
        </Pane>

        <Split direction="vertical" growWeight={3}>
          <Pane minWidth={920} minHeight={96} growWeight={0}>
            <div className="flex h-full items-center justify-between gap-6 bg-gradient-to-r from-cyan-500/12 via-slate-900 to-fuchsia-500/12 px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Layout Prototype
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Recursive split panes with derived minimum sizing
                </h1>
              </div>
              <div className="grid grid-cols-3 gap-3 text-right">
                <MetricCard label="Root Overflow" value="scroll" />
                <MetricCard label="Min Width" value="1520px" />
                <MetricCard label="Min Height" value="780px" />
              </div>
            </div>
          </Pane>

          <Split direction="horizontal" growWeight={1}>
            <Split direction="vertical" growWeight={4}>
              <Split direction="horizontal" growWeight={1}>
                <Pane minWidth={380} minHeight={220} growWeight={2}>
                  <ContentGrid
                    accent="cyan"
                    rows={[
                      ['API gateway', 'Healthy', '24 ms'],
                      ['Scheduler', 'Degraded', '216 ms'],
                      ['Notifier', 'Healthy', '41 ms'],
                    ]}
                  />
                </Pane>
                <Pane minWidth={320} minHeight={220} growWeight={1}>
                  <AlertStack />
                </Pane>
              </Split>

              <Split direction="horizontal" growWeight={2}>
                <Pane minWidth={460} minHeight={360} growWeight={3}>
                  <WorkspacePreview />
                </Pane>
                <Pane minWidth={220} minHeight={360} growWeight={1}>
                  <Timeline />
                </Pane>
              </Split>
            </Split>

            <Pane minWidth={280} minHeight={580} growWeight={1}>
              <InspectorDetails />
            </Pane>
          </Split>
        </Split>
      </Split>
    </LayoutRoot>
  )
}

type SidebarSectionProps = {
  items: string[]
  title: string
}

function SidebarSection({ items, title }: SidebarSectionProps): ReactElement {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-slate-300"
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps): ReactElement {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
    </div>
  )
}

type ContentGridProps = {
  accent: 'cyan' | 'emerald'
  rows: [string, string, string][]
}

function ContentGrid({ accent, rows }: ContentGridProps): ReactElement {
  const accentClass =
    accent === 'cyan'
      ? 'from-cyan-500/18 to-cyan-500/0'
      : 'from-emerald-500/18 to-emerald-500/0'

  return (
    <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden bg-slate-950">
      <div className={`bg-gradient-to-r ${accentClass} px-5 py-4 text-sm text-slate-300`}>
        Child content is clipped inside each pane. Only the root owns overflow.
      </div>
      <div className="overflow-hidden px-5 py-4">
        <div className="grid h-full grid-cols-[1.8fr_1fr_1fr] gap-px overflow-hidden rounded-xl bg-slate-800">
          <div className="contents">
            {rows.flatMap(([name, status, latency]) => [
              <Cell key={`${name}-name`} className="bg-slate-900 text-white">
                {name}
              </Cell>,
              <Cell key={`${name}-status`} className="bg-slate-900">
                {status}
              </Cell>,
              <Cell key={`${name}-latency`} className="bg-slate-900 text-right">
                {latency}
              </Cell>,
            ])}
          </div>
        </div>
      </div>
    </div>
  )
}

type CellProps = {
  children: string
  className?: string
}

function Cell({ children, className }: CellProps): ReactElement {
  return (
    <div className={['px-4 py-3 text-sm text-slate-300', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

function AlertStack(): ReactElement {
  const alerts = [
    ['Scheduler retries above threshold', '2m ago'],
    ['US-East ingest lag detected', '8m ago'],
    ['Webhook relay bounced', '11m ago'],
    ['Edge cache warming slower than target', '19m ago'],
  ]

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden bg-slate-950 p-4">
      {alerts.map(([message, time]) => (
        <article
          key={message}
          className="rounded-xl border border-amber-400/20 bg-amber-500/8 px-4 py-3"
        >
          <div className="text-sm font-medium text-amber-100">{message}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-300/70">
            {time}
          </div>
        </article>
      ))}
    </div>
  )
}

function WorkspacePreview(): ReactElement {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] overflow-hidden bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <div className="text-sm font-medium text-white">Primary Work Surface</div>
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            Nested split inside the main branch
          </div>
        </div>
        <div className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
          growWeight=3
        </div>
      </div>
      <div className="grid min-h-0 grid-cols-[1.4fr_1fr] gap-4 overflow-hidden p-5">
        <div className="grid min-h-0 grid-rows-[1.2fr_1fr] gap-4 overflow-hidden">
          <SurfaceBox title="Live Graph" />
          <SurfaceBox title="Recent Jobs" />
        </div>
        <div className="grid min-h-0 grid-rows-[1fr_1fr_1fr] gap-4 overflow-hidden">
          <SurfaceBox title="Filters" />
          <SurfaceBox title="Selection" />
          <SurfaceBox title="Annotations" />
        </div>
      </div>
    </div>
  )
}

type SurfaceBoxProps = {
  title: string
}

function SurfaceBox({ title }: SurfaceBoxProps): ReactElement {
  return (
    <section className="min-h-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 p-4">
      <div className="text-sm font-medium text-white">{title}</div>
      <div className="mt-3 h-full rounded-lg border border-dashed border-slate-700 bg-slate-950/70" />
    </section>
  )
}

function Timeline(): ReactElement {
  const entries = [
    '09:10 deployment started',
    '09:18 worker pool rebalanced',
    '09:24 backlog normalized',
    '09:31 cold shard promoted',
    '09:36 audit export queued',
  ]

  return (
    <div className="h-full overflow-hidden bg-slate-950 px-4 py-4">
      <ol className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 text-sm text-slate-300"
          >
            {entry}
          </li>
        ))}
      </ol>
    </div>
  )
}

function InspectorDetails(): ReactElement {
  const details = [
    ['Focused pane', 'Workspace'],
    ['Tree depth', '4 levels'],
    ['Cross-axis policy', 'stretch'],
    ['Child overflow', 'hidden'],
    ['Root overflow', 'scroll'],
  ]

  return (
    <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden bg-slate-950">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-sm text-slate-300">
          Splits derive their minimum size entirely from descendants. Only panes
          define raw width and height constraints.
        </p>
      </div>
      <dl className="space-y-3 overflow-hidden px-5 py-5">
        {details.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <dt className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default App
