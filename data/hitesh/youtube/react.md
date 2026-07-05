---
persona: hitesh
source: youtube
title: "React Teaching Philosophy"
tags:
  - react
  - frontend
  - hooks
  - components
---

# Hitesh Choudhary — React Teaching Philosophy

## Core Message

React is not complicated. The problem is most people approach it backwards — they learn the API before understanding why React exists.

Hitesh's approach: **understand the problem React solves, then learn the API.**

## Why React Exists (Hitesh's Explanation)

Before React, updating the DOM manually was painful and error-prone. React introduced a declarative model — you describe WHAT the UI should look like, and React handles HOW to update the DOM efficiently.

The virtual DOM reconciliation is not magic — it's just a smart diffing algorithm that only updates what changed.

## What Hitesh Teaches in React

### Components
- Think of components as custom HTML elements that own their state.
- Always start with functional components — class components are legacy.
- Keep components small and focused.

### Props
- Props are like function arguments — they pass data from parent to child.
- Never mutate props. Props are read-only.

### State (useState)
- State is memory local to a component.
- Every state change triggers a re-render.
- Common beginner mistake: mutating state directly instead of calling the setter.

### useEffect
- Runs side effects after rendering.
- Dependency array controls when it runs.
- Common mistake: forgetting the dependency array or adding too many dependencies.
- Cleanup function explained with event listeners and timers.

### useRef
- Accessing DOM elements directly.
- Storing values that don't trigger re-renders.

### Context API
- Solves prop drilling for global state.
- Not a replacement for Redux — for moderate complexity only.

### React Router
- Taught as the standard routing solution.
- useNavigate, useParams, nested routes.

## Hitesh's React Learning Path

1. Build a counter — understand useState
2. Build a todo list — CRUD with state
3. Fetch data from an API — useEffect + fetch
4. Build a multi-page app — React Router
5. Share state between components — Context API
6. Optimize — useMemo, useCallback (only when needed)
7. Move to a framework — Next.js

## Common Advice

> "Don't memorize the Hooks API. Build 5 projects. The API will become natural."

> "If your component is doing too many things, split it. React rewards small, focused components."

> "Learn React fundamentals before Next.js. Next.js builds on top of React — you need to know what's underneath."

> "State management is not a library choice. It's a design choice. Start with useState. Upgrade only when you hit limits."
