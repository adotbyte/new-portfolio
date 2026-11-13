![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_AI-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)

## 🚀 AI-Powered Portfolio — Next.js

A modern, self-hosted portfolio website featuring an **AI Agent** powered by **Anthropic Claude**, built with **Next.js**, containerized with **Docker**, and secured via **Cloudflare Zero Trust**.

## 🛡️ Infrastructure & Security

- **Cloudflare Tunnel:** Hosted behind a secure tunnel (`cloudflared`), keeping the server invisible to the public internet with **zero open inbound ports**.
- **Zero Trust Perimeter:** Outbound-only connectivity ensures high security.
- **WAF & DDoS Protection:** Leverages Cloudflare's global network to mitigate common web attacks.
- **Cloudflare Turnstile:** Bot protection on the contact form.
- **Custom Security Rules:** Strict system prompt with guardrails, rate limiting, and XSS-safe backend logic.

## 🏗️ Technical Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **AI Engine:** Anthropic Claude agent with tool use — fetches live GitHub repos, sends contact emails, checks availability, performs web searches, and remembers visitors.
- **Email:** Resend
- **DevOps:** Docker, Docker Compose, GitHub Actions (self-hosted runner on Raspberry Pi 5)
- **Network:** Cloudflare Zero Trust, Tunneling
- **Monitoring:** Grafana, Prometheus, Alloy
- **Database:** PostgreSQL with `pgvector` for RAG and long-term memory

## 🧠 Advanced AI Agent (RAG + Memory + Web Search)

The chatbot is a true **agentic system** — not just a Q&A bot. It combines multiple advanced techniques:

### 📚 Retrieval-Augmented Generation (RAG)

- Ingests `about_me.md`, project `README.md` files, and GitHub repos into a **`pgvector`** knowledge base.
- Generates embeddings via **Voyage AI** (`voyage-4-lite`).
- Retrieves the most relevant context chunks before answering, ensuring accurate and grounded responses.

### 🧠 Long-Term Memory

- Extracts durable facts about visitors (e.g., interests, constraints) using Claude.
- Stores them as embeddings in the **`Memory`** table.
- Recalls relevant facts in future conversations to provide a personalized experience.

### 🌐 Web Search

- Integrated with Anthropic's **`web_search`** tool (limited to 3 searches per query to control costs).
- Allows the agent to fetch real-time information about technologies, news, or events.

### 🛠️ Tool Use

- **`get_github_repos`** — fetches latest GitHub projects dynamically via GitHub API.
- **`send_contact_email`** — gathers visitor name, email, and message, then sends directly to Zoho inbox.
- **`get_availability`** — answers whether Audrius is open to new opportunities.

### 💬 PDF Export

- Visitors can export the entire chat transcript as a **polished PDF**.
- Includes a custom **Roboto** font for Lithuanian characters, colored role labels, date, and clickable links.

## 🛡️ Security & Guardrails

This AI agent is designed with a security-first approach. It is not just a simple wrapper around an LLM API; it includes multiple layers of defense to prevent abuse, prompt injection, and data leakage.

### 1. Input Validation & Rate Limiting
- **Zod Schemas**: All incoming messages are strictly validated for type, length (max 2000 chars), and locale (only `lt` or `en` allowed). Empty or malformed requests are rejected before reaching the LLM.
- **IP-Based Rate Limiting**: 
  - Chat messages are limited to **10 requests per hour** per IP.
  - The email sending tool (`send_contact_email`) has its own stricter limit of **2 emails per hour** to prevent spam.
- **Cloudflare Integration**: The agent correctly extracts the real visitor IP using the `cf-connecting-ip` header (when deployed behind Cloudflare), ensuring rate limits cannot be bypassed via header spoofing.

### 2. Prompt Injection Defense (LLM01)
- **System Prompt Hardening**: The core system prompt explicitly forbids the model from ignoring instructions, revealing its system prompt, or executing "jailbreak" commands.
- **Suspicious Input Logging**: Incoming messages are scanned for known injection patterns (e.g., "ignore previous instructions", "system prompt", "jailbreak"). Suspicious attempts are logged to the server console with a `🚨 [SECURITY WARNING]` tag for auditing, without disrupting legitimate users.
- **System File Integrity**: The optional `prompts/system.md` file is scanned for suspicious override patterns before being injected into the system prompt, preventing accidental or malicious rule changes.

### 3. RAG & Context Isolation
- **Context Isolation**: When retrieving information from the Knowledge Base (via Voyage AI), the context is wrapped in `<context>` tags. The system prompt explicitly instructs the LLM to treat everything inside these tags as **data only**, never as executable instructions.
- **Sanitization**: Retrieved context is sanitized to remove common injection phrases before being sent to the model.

### 4. Output & Action Safety (LLM03 & LLM10)
- **Controlled Agency**: The agent has only one action tool (`send_contact_email`). It cannot execute arbitrary code, delete data, or contact third parties. Emails are sent exclusively to the site owner.
- **XSS Protection**: All user inputs (name, email, message) are escaped using `escapeHtml()` before being rendered in the HTML email template.
- **Header Injection Prevention**: The `replyTo` field strips newline characters (`\r\n`) to prevent email header injection attacks.
- **Cookie Security**: The `visitor_id` cookie is set with `httpOnly: true`, `secure: true` (in production), and `sameSite: 'lax'` to prevent XSS and CSRF attacks.

### 5. Tool Restrictions
- **Web Search**: Limited to a maximum of 3 uses per request to control costs and prevent abuse.
- **GitHub API**: Uses a `User-Agent` header and optional `GH_TOKEN` to avoid rate limiting from GitHub's side.

## 📝 Blog & Case Studies (New!)

This portfolio features a fully-fledged, bilingual blog and a dedicated Case Studies section.

- **Automated Translation:** New blog posts are automatically translated from Lithuanian to English using **Claude AI** and **Tyndale** during the CI/CD pipeline.
- **Dynamic Open Graph Images:** Every blog post automatically generates a custom, branded Open Graph image for social media sharing.
- **RAG-Indexed Content:** Blog articles are automatically indexed into the `KnowledgeBase` table, allowing the AI agent to answer questions based on the written content.
- **Case Studies:** A dedicated section showcasing real-world problems and their solutions, designed to demonstrate value to potential clients.
- **Interactive Code Playground:** Select technical articles include an interactive JavaScript playground, allowing readers to experiment with code directly in the browser.

## 📊 Real-time Monitoring Integration

This portfolio features a **native, self-hosted monitoring dashboard** built directly into the page using **Recharts** and **Next.js API routes**. It fetches live metrics from **Prometheus** (running on the Raspberry Pi 5) and displays them without the need for heavy `iframe` embeds.

- **Metrics Collection:** `docker-exporter` collects container-level CPU and memory usage (bypassing `cadvisor` ARM64 limitations).
- **Aggregation & Routing:** `Grafana Alloy` scrapes metrics and forwards them to a local **Prometheus** instance.
- **Frontend Visualization:** A custom Next.js API route (`/api/prometheus`) queries Prometheus, and the data is rendered as an interactive, theme-aware line chart using `Recharts`.

**Live Metrics Displayed:**

- Real-time **CPU usage** (%) across all Docker containers.
- Real-time **RAM usage** (MB) across all Docker containers.

## 💻 Interactive Terminal (The "Wow" Factor) 🚀

This portfolio includes a **fully interactive, in-browser terminal** built with `@xterm/xterm`. It’s not just a static visual — visitors can type commands and get **real, live data** from the Raspberry Pi 5.

**What it does:**

- **Real System Commands:** Type `docker ps`, `uptime`, or `free -h` to see live data from the server.
- **Portfolio Navigation:** Type `about`, `skills`, `projects`, or `contact` to explore the portfolio in a unique, command-line way.
- **Fun Commands:** Type `neofetch` for a system info summary or `matrix` for a visual effect.
- **Bilingual:** Supports both English and Lithuanian command aliases (`help` / `pagalba`, `about` / `apie`).
- **Theme-Aware:** The terminal automatically switches between light and dark themes and is fully responsive on mobile.
- **Zero Backend Risk:** All commands are handled safely via Next.js API routes.

## 🚀 CI/CD & Automated Quality Assurance (New!)

The project uses a sophisticated GitHub Actions pipeline with a **self-hosted runner** on the Raspberry Pi 5.

- **Automated Deployment:** Every push to `main` triggers an automated rebuild and redeployment of the Docker containers.
- **Automated Translations:** The CI pipeline automatically runs `tyndale` to translate new blog posts.
- **Lighthouse CI Integration:** After deployment, a separate GitHub-hosted runner executes **Lighthouse CI** to test the live site.
- **Performance Guardrails:** Custom assertions ensure that Performance, Accessibility, Best Practices, and SEO scores never drop below defined thresholds (currently set to 90+). If scores drop, the pipeline fails, preventing regressions.
- **Visual Reports:** Lighthouse results are automatically formatted into a summary table in the GitHub Actions run.

## 🖥️ Hardware

Running on a **Raspberry Pi 5 (16GB RAM)** with **2× 2TB NVMe SSD** storage, self-hosted at home.

## ⚙️ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/adotbyte/new-portfolio.git
cd new-portfolio
```

### 2. Create `.env` file

```bash
ANTHROPIC_API_KEY=your_key
TURNSTILE_SECRET_KEY=your_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_key
RESEND_API_KEY=your@email.com
RESEND_FROM_EMAIL=your@email.com
CONTACT_EMAIL=your@email.com
FB_APP_ID=your_fb_app_id
GH_TOKEN=your_github_token
PROMETHEUS_URL=http://your-server-ip:9090
VOYAGE_API_KEY=your_voyage_key
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
```

### 3. Run with Docker Compose

```bash
docker compose up --build
```

### 4. Access the Application

```
http://localhost:8080
```

## 🌐 Live

[morkunas.info](https://morkunas.info)
