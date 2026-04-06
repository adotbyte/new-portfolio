![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google&logoColor=white)

## 🚀 AI-Powered Portfolio — Next.js

A modern, self-hosted portfolio website featuring an **AI Chatbot** powered by **Gemini AI**, built with **Next.js**, containerized with **Docker**, and secured via **Cloudflare Zero Trust**.

## 🛡️ Infrastructure & Security

* **Cloudflare Tunnel:** Hosted behind a secure tunnel (`cloudflared`), keeping the server invisible to the public internet with **zero open inbound ports**.
* **Zero Trust Perimeter:** Outbound-only connectivity ensures high security.
* **WAF & DDoS Protection:** Leverages Cloudflare's global network to mitigate common web attacks.
* **Cloudflare Turnstile:** Bot protection on the contact form.

## 🏗️ Technical Stack

* **Frontend:** Next.js 16, React, Tailwind CSS
* **AI Engine:** Gemini AI chatbot with `about_me.md` context (RAG-lite)
* **Email:** Nodemailer via Zoho SMTP
* **DevOps:** Docker, Docker Compose, GitHub Actions (self-hosted runner on Raspberry Pi 5)
* **Network:** Cloudflare Zero Trust, Tunneling

## 🖥️ Hardware

Running on a **Raspberry Pi 5 (16GB RAM)** with **2× 2TB NVMe SSD** storage, self-hosted at home.

## ⚙️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/adotbyte/resume_website.git
cd resume_website
```

### 2. Create `.env` file
```bash
GEMINI_API_KEY=your_key
TURNSTILE_SECRET_KEY=your_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_key
ZOHO_EMAIL=your@email.com
ZOHO_PASSWORD=your_password
CONTACT_EMAIL=your@email.com
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