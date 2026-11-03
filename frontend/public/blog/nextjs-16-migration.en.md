---
title: "How I Solved the Next.js 16 Migration Headaches"
description: "The problems I encountered migrating my portfolio to Next.js 16 and how I solved them."
---

# How I Solved the Next.js 16 Migration Headaches

My portfolio ran on an old Next.js version for a long time. It worked flawlessly, but I knew it was time to upgrade. The main reason was **security**. In my work, security is priority number one. While 100% protection is never guaranteed, you must protect yourself as much as possible. That's why I decided to upgrade my application to the latest Next.js 16 version.

This wasn't a simple "one-button" solution. The migration brought a few unexpected obstacles that I had to deal with. In this article, I'll share the problems I encountered and how I solved them.

## 1. Turbopack and `fetch` Issues

Next.js 16 uses the new **Turbopack** compiler by default. It's a very fast tool, but it has its own quirks. One of the biggest problems I ran into was `fetch` calls in API routes.

Some of my API routes (e.g., `/api/prometheus` or `/api/homelab`) started throwing a `HANGING_PROMISE_REJECTION` error. It turns out that Next.js 16 with the `cacheComponents` feature tries to statically generate these routes during `build`, which takes a long time while waiting for a response from external sources.

**Solution:** In these API routes, I added `await connection()` from `next/server`. This forces Next.js to understand that this route should only be executed at request time, not during static generation.

## 2. The `cacheComponents` and `params` Problem

Another error was related to `cacheComponents` and server components. Next.js 16 requires that `params` be read only within `Suspense` boundaries. My `AboutMe` component tried to read `locale` through `getTranslations` and `headers()`, which caused an error.

**Solution:** I wrapped the `AboutMe` component in `<Suspense>` with a `fallback` (skeleton) and moved the `params` reading into a separate asynchronous function.

## 3. `next-themes` and React 19

React 19, which comes with Next.js 16, more strictly checks which components can use `<script>` tags. The `next-themes` library used an inline `<script>`, which produced a warning.

**Solution:** I wrapped `ThemeProvider` and added a targeted `console.error` filter that suppresses only this specific warning. This allows me to keep the theme-switching functionality without errors.

## 4. Blog and PDF Generation Challenges

During the migration, I also had to update the PDF generation logic. The `jsPDF` library doesn't always properly support Lithuanian characters, so I had to load a special `.ttf` font with the `latin-ext` subset. I also had to fix the rendering of `ReactMarkdown` code blocks so they look nice on both light and dark backgrounds.

## The Result

After several hours of work and many attempts, my portfolio now successfully runs on Next.js 16. It's now safer, faster, and more modern. The migration was a challenge, but it was worth every effort.

## How Can I Help You?

If your application still runs on an old Next.js version, I can help you upgrade it. I know what problems you'll face, and I can solve them faster than those encountering them for the first time. Security and performance are my priorities, so I can ensure that your application is not only beautiful but also secure.

Let's get in touch – I'd be happy to discuss your project's needs.