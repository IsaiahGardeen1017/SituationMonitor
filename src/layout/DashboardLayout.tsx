/* eslint-disable react-refresh/only-export-components */
import {
  Children,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  isValidElement,
} from 'react'

type LayoutDirection = 'horizontal' | 'vertical'
type RootOverflow = 'clip' | 'scroll'
type PaneOverflow = 'clip' | 'scroll'

type BaseNodeProps = {
  growWeight?: number
}

export type PaneProps = BaseNodeProps & {
  children?: ReactNode
  className?: string
  minHeight: number
  minWidth: number
  overflow?: PaneOverflow
}

export type SplitProps = BaseNodeProps & {
  children: ReactNode
  className?: string
  direction: LayoutDirection
}

type LayoutRootProps = {
  children: ReactElement<PaneProps | SplitProps>
  className?: string
  overflow?: RootOverflow
}

type BaseResolvedNode = {
  className?: string
  growWeight: number
  minHeight: number
  minWidth: number
}

type ResolvedPaneNode = BaseResolvedNode & {
  children?: ReactNode
  overflow: PaneOverflow
  type: 'pane'
}

type ResolvedSplitNode = BaseResolvedNode & {
  children: ResolvedNode[]
  direction: LayoutDirection
  type: 'split'
}

type ResolvedNode = ResolvedPaneNode | ResolvedSplitNode

const splitMarker = Symbol('split')
const paneMarker = Symbol('pane')

type MarkedComponent<P> = ((props: P) => null) & { __layoutMarker: symbol }

export const Pane = Object.assign(
  function Pane(): null {
    return null
  },
  { __layoutMarker: paneMarker },
) as MarkedComponent<PaneProps>

export const Split = Object.assign(
  function Split(): null {
    return null
  },
  { __layoutMarker: splitMarker },
) as MarkedComponent<SplitProps>

export function LayoutRoot({
  children,
  className,
  overflow = 'scroll',
}: LayoutRootProps): ReactElement {
  const tree = resolveNode(children)

  return (
    <div
      className={[
        'h-screen w-screen bg-neutral-800 text-neutral-100',
        overflow === 'scroll' ? 'overflow-auto' : 'overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="h-full w-full"
        style={{
          minHeight: `${tree.minHeight}px`,
          minWidth: `${tree.minWidth}px`,
        }}
      >
        {renderNode(tree)}
      </div>
    </div>
  )
}

function resolveNode(element: ReactElement<PaneProps | SplitProps>): ResolvedNode {
  if (isLayoutElement<PaneProps>(element, Pane)) {
    return {
      type: 'pane',
      growWeight: element.props.growWeight ?? 0,
      minHeight: element.props.minHeight,
      minWidth: element.props.minWidth,
      className: element.props.className,
      children: element.props.children,
      overflow: element.props.overflow ?? 'clip',
    }
  }

  if (isLayoutElement<SplitProps>(element, Split)) {
    const children = Children.toArray(element.props.children)
      .filter((child): child is ReactElement<PaneProps | SplitProps> => {
        if (!isValidElement(child)) {
          return false
        }

        return isLayoutElement(child, Pane) || isLayoutElement(child, Split)
      })
      .map(resolveNode)

    if (children.length === 0) {
      throw new Error('Split requires at least one Pane or nested Split child.')
    }

    if (element.props.direction === 'horizontal') {
      return {
        type: 'split',
        direction: 'horizontal',
        growWeight: element.props.growWeight ?? 0,
        className: element.props.className,
        children,
        minWidth: children.reduce((sum, child) => sum + child.minWidth, 0),
        minHeight: children.reduce(
          (maxHeight, child) => Math.max(maxHeight, child.minHeight),
          0,
        ),
      }
    }

    return {
      type: 'split',
      direction: 'vertical',
      growWeight: element.props.growWeight ?? 0,
      className: element.props.className,
      children,
      minWidth: children.reduce(
        (maxWidth, child) => Math.max(maxWidth, child.minWidth),
        0,
      ),
      minHeight: children.reduce((sum, child) => sum + child.minHeight, 0),
    }
  }

  throw new Error('LayoutRoot only accepts Pane or Split nodes.')
}

function renderNode(node: ResolvedNode): ReactElement {
  if (node.type === 'pane') {
    return (
      <section
        className={[
          'flex h-full w-full min-h-0 min-w-0 flex-col overflow-hidden border-2 border-solid border-orange-500 bg-neutral-900',
          node.className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'min-h-0 min-w-0 flex-1',
            node.overflow === 'scroll' ? 'overflow-auto' : 'overflow-hidden',
          ].join(' ')}
        >
          {node.children}
        </div>
      </section>
    )
  }

  const isHorizontal = node.direction === 'horizontal'

  return (
    <div
      className={[
        'flex h-full w-full min-h-0 min-w-0 overflow-hidden',
        isHorizontal ? 'flex-row' : 'flex-col',
        node.className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {node.children.map((child, index) => (
        <div
          key={`${child.type}-${index}`}
          className={[
            'min-h-0 min-w-0 overflow-hidden',
            index > 0 ? (isHorizontal ? '-ml-0.5' : '-mt-0.5') : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={getChildStyle(child, node.direction)}
        >
          {renderNode(child)}
        </div>
      ))}
    </div>
  )
}

function getChildStyle(
  child: ResolvedNode,
  direction: LayoutDirection,
): CSSProperties {
  const axisBasis = direction === 'horizontal' ? child.minWidth : child.minHeight

  return {
    flexBasis: `${axisBasis}px`,
    flexGrow: child.growWeight,
    flexShrink: 0,
    minHeight: `${child.minHeight}px`,
    minWidth: `${child.minWidth}px`,
  }
}

function isLayoutElement<P>(
  value: ReactNode,
  component: MarkedComponent<P>,
): value is ReactElement<P> {
  return (
    isValidElement(value) &&
    typeof value.type === 'function' &&
    '__layoutMarker' in value.type &&
    value.type.__layoutMarker === component.__layoutMarker
  )
}
