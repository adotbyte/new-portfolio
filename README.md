![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Claude](https://img.shields.io/badge/Claude_AI-D97757?style=for-the-badge&logo=anthropic&logoColor=white)

## 🚀 AI-Powered Portfolio — Next.js

A modern, self-hosted portfolio website featuring an **AI Agent** powered by **Anthropic Claude**, built with **Next.js**, containerized with **Docker**, and secured via **Cloudflare Zero Trust**.

## 🛡️ Infrastructure & Security

* **Cloudflare Tunnel:** Hosted behind a secure tunnel (`cloudflared`), keeping the server invisible to the public internet with **zero open inbound ports**.
* **Zero Trust Perimeter:** Outbound-only connectivity ensures high security.
* **WAF & DDoS Protection:** Leverages Cloudflare's global network to mitigate common web attacks.
* **Cloudflare Turnstile:** Bot protection on the contact form.

## 🏗️ Technical Stack

* **Frontend:** Next.js 16, React, Tailwind CSS
* **AI Engine:** Anthropic Claude agent with tool use — fetches live GitHub repos, sends contact emails, checks availability
* **Email:** Nodemailer via Zoho SMTP
* **DevOps:** Docker, Docker Compose, GitHub Actions (self-hosted runner on Raspberry Pi 5)
* **Network:** Cloudflare Zero Trust, Tunneling

## 🤖 AI Agent Capabilities

The chatbot is a true **agentic system** — not just a Q&A bot:

* **🐙 Live GitHub repos** — fetches latest projects dynamically via GitHub API
* **📧 Contact collection** — gathers visitor name, email, and message, then sends directly to Zoho inbox
* **✅ Availability status** — answers whether Audrius is open to new opportunities

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
ZOHO_EMAIL=your@email.com
ZOHO_PASSWORD=your_app_password
CONTACT_EMAIL=your@email.com
FB_APP_ID=your_fb_app_id
GH_TOKEN=your_github_token
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