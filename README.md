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

## 🏗️ Technical Stack

- **Frontend:** Next.js 16, React, Tailwind CSS
- **AI Engine:** Anthropic Claude agent with tool use — fetches live GitHub repos, sends contact emails, checks availability
- **Email:** Resend
- **DevOps:** Docker, Docker Compose, GitHub Actions (self-hosted runner on Raspberry Pi 5)
- **Network:** Cloudflare Zero Trust, Tunneling
- **Monitoring:** Grafana, Prometheus, Alloy

## 📊 Real-time Monitoring Integration

This portfolio features a **native, self-hosted monitoring dashboard** built directly into the page using **Recharts** and **Next.js API routes**. It fetches live metrics from **Prometheus** (running on the Raspberry Pi 5) and displays them without the need for heavy `iframe` embeds.

- **Metrics Collection:** `docker-exporter` collects container-level CPU and memory usage (bypassing `cadvisor` ARM64 limitations).
- **Aggregation & Routing:** `Grafana Alloy` scrapes metrics and forwards them to a local **Prometheus** instance.
- **Frontend Visualization:** A custom Next.js API route (`/api/prometheus`) queries Prometheus, and the data is rendered as an interactive, theme-aware line chart using `Recharts`.

**Live Metrics Displayed:**
- Real-time **CPU usage** (%) across all Docker containers.
- Real-time **RAM usage** (MB) across all Docker containers.

## 💻 Interactive Terminal (The "Wow" Factor) 🚀

This portfolio includes a **fully interactive, in-browser terminal** built with `xterm.js`. It’s not just a static visual — visitors can type commands and get **real, live data** from the Raspberry Pi 5.

**What it does:**
- **Real System Commands:** Type `docker ps`, `uptime`, or `free -h` to see live data from the server.
- **Portfolio Navigation:** Type `about`, `skills`, `projects`, or `contact` to explore the portfolio in a unique, command-line way.
- **Theme-Aware:** The terminal automatically switches between light and dark themes.
- **Zero Backend Risk:** All commands are handled safely via Next.js API routes.

**Why it’s impressive:**
- It demonstrates deep understanding of **system-level metrics**, **API design**, and **frontend interactivity**.
- It’s a **conversation starter** — visitors love typing commands and seeing the server respond.
- It’s **fully self-hosted**, running on a Raspberry Pi 5 with zero open inbound ports.

> *"This is one of the most creative and technically impressive portfolio features I’ve seen. It shows not just coding skills, but a deep understanding of infrastructure and user experience."*

## 🤖 AI Agent Capabilities

The chatbot is a true **agentic system** — not just a Q&A bot:

- **🐙 Live GitHub repos** — fetches latest projects dynamically via GitHub API
- **📧 Contact collection** — gathers visitor name, email, and message, then sends directly to Zoho inbox
- **✅ Availability status** — answers whether Audrius is open to new opportunities

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
