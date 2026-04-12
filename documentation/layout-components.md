# Layout Components

## Overview

This layout system is a recursive set of React components for building fixed dashboard regions without letting child content control parent sizing.

It has three components:
- `LayoutRoot`
- `Split`
- `Pane`

The layout is a tree:
- `Split` divides space horizontally or vertically
- `Pane` is a leaf node that contains real content
- `LayoutRoot` owns the viewport and root overflow behavior

Minimum sizes come only from `Pane`.
`Split` computes its minimum width and height from its children.
Extra space is distributed by `growWeight`.

## `LayoutRoot`

`LayoutRoot` is the viewport container for the whole layout tree.

Behavior:
- fills the viewport
- computes the full layout tree minimum width and height
- applies root-level overflow behavior
- expects a single top-level `Split` or `Pane`

Props:
- `children`
  The top-level layout node.
- `className?: string`
  Optional extra classes for the root container.
- `overflow?: 'clip' | 'scroll'`
  Controls what happens when the layout minimum is larger than the viewport.
  - `scroll`: the root scrolls
  - `clip`: overflowing content is cut off

## `Split`

`Split` divides its available space among child layout nodes.

Behavior:
- lays out children in a row or column
- can contain `Pane` children, nested `Split` children, or both
- computes its minimum size from descendants
- uses `growWeight` to decide how this subtree grows when extra space exists

Props:
- `children`
  One or more `Pane` or `Split` nodes.
- `className?: string`
  Optional extra classes for the split container.
- `direction: 'horizontal' | 'vertical'`
  Controls the axis used to divide space.
- `growWeight?: number`
  Controls how much this whole split grows when it is a child of another split.
  - `0`: do not grow beyond minimum size
  - `> 0`: share extra space proportionally

Minimum size rules:

For `direction="horizontal"`:
- `minWidth = sum(child.minWidth)`
- `minHeight = max(child.minHeight)`

For `direction="vertical"`:
- `minWidth = max(child.minWidth)`
- `minHeight = sum(child.minHeight)`

## `Pane`

`Pane` is a leaf layout node that wraps actual app content.

Behavior:
- defines the raw minimum size of a leaf
- receives its actual size from the parent split
- does not let its content resize parent layout
- can clip or scroll its own content area

Props:
- `children?: ReactNode`
  The pane content.
- `className?: string`
  Optional extra classes for the pane shell.
- `minWidth: number`
  Minimum width of this pane in pixels.
- `minHeight: number`
  Minimum height of this pane in pixels.
- `growWeight?: number`
  Controls how much this pane grows when extra space exists.
  - `0`: stay at minimum size
  - `> 0`: share extra space proportionally
- `overflow?: 'clip' | 'scroll'`
  Controls pane-local overflow behavior.
  - `clip`: pane content is clipped
  - `scroll`: pane content area scrolls

## Examples

Simple horizontal layout:

```tsx
<LayoutRoot overflow="scroll">
  <Split direction="horizontal" growWeight={1}>
    <Pane minWidth={240} minHeight={600} growWeight={0}>
      <Sidebar />
    </Pane>
    <Pane minWidth={600} minHeight={600} growWeight={1}>
      <MainContent />
    </Pane>
  </Split>
</LayoutRoot>
```

Nested layout:

```tsx
<LayoutRoot overflow="scroll">
  <Split direction="horizontal" growWeight={1}>
    <Pane minWidth={240} minHeight={780} growWeight={0}>
      <Sidebar />
    </Pane>

    <Split direction="vertical" growWeight={3}>
      <Pane minWidth={920} minHeight={96} growWeight={0}>
        <Banner />
      </Pane>

      <Split direction="horizontal" growWeight={1}>
        <Pane minWidth={500} minHeight={400} growWeight={3}>
          <MainWorkspace />
        </Pane>

        <Pane minWidth={320} minHeight={400} growWeight={1} overflow="scroll">
          <AlertStack />
        </Pane>
      </Split>
    </Split>
  </Split>
</LayoutRoot>
```

Pane-local scrolling:

```tsx
<Pane minWidth={320} minHeight={220} growWeight={1} overflow="scroll">
  <AlertStack />
</Pane>
```
