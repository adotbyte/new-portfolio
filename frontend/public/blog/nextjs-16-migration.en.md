# How I Solved the Next.js 16 Migration Headaches

My portfolio ran on an old version of Next.js for a long time. It worked flawlessly, but I knew it was time to upgrade. The main reason was **security**. In my line of work, security is priority number one. While 100% protection is never guaranteed, you still have to protect yourself as much as possible. That's why I decided to upgrade my application to the latest Next.js 16 version.

This wasn't a simple "one-button" solution. The migration brought several unexpected obstacles that I had to deal with. In this article, I'll share the problems I faced and how I solved them.

## 1. Turbopack and fetch issues

Next.js 16 uses the new **Turbopack** compiler by default. It's a very fast tool, but it has its own quirks. One of the biggest problems I ran into was **fetch** calls in API routes.

Some of my API routes (e.g., **/api/prometheus** or **/api/homelab**) started throwing a **HANGING_PROMISE_REJECTION** error. It turned out that Next.js 16, with the **cacheComponents** feature, tries to statically generate these routes during **build**, which takes a long time while waiting for responses from external sources.

**Solution:** In these API routes, I added **await connection()** from **next/server**. This forces Next.js to understand that this route should only be executed at request time, not during static generation.

## 2. cacheComponents and params issue

Another error was related to **cacheComponents** and server components. Next.js 16 requires that **params** be read only within **Suspense** boundaries. My **AboutMe** component tried to read **locale** via **getTranslations** and **headers()**, which caused an error.

**Solution:** I wrapped the **AboutMe** component in **<Suspense>** with a **fallback** (skeleton) and moved the **params** reading into a separate asynchronous function.

## 3. next-themes and React 19

React 19, which comes with Next.js 16, more strictly checks which components can use **<script>** tags. The **next-themes** library used an inline **<script>**, which triggered a warning.

**Solution:** I wrapped **ThemeProvider** and added a targeted **console.error** filter that suppresses only this specific warning. This keeps the theme-switching functionality working without errors.

## 4. Blog and PDF generation challenges

During the migration, I also had to update the PDF generation logic. The **jsPDF** library doesn't always properly support Lithuanian characters, so I had to load a special **.ttf** font with the **latin-ext** subset. I also had to fix the **ReactMarkdown** code block rendering so that it looks good on both light and dark backgrounds.

## The Result

After several hours of work and countless attempts, my portfolio successfully runs on Next.js 16. It's now more secure, faster, and more modern. The migration was a challenge, but it was worth every bit of effort.

## How Can I Help You?

If your application is still running on an old version of Next.js, I can help you upgrade it. I know the kinds of problems you'll encounter, and I can solve them faster than those facing them for the first time. Security and performance are my priorities, so I can ensure your application is not only beautiful but also secure.

Let's get in touch — I'd be happy to discuss your project's needs.