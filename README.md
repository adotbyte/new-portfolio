![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Django](https://img.shields.io/badge/django-%23092e20.svg?style=for-the-badge&logo=django&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-white?style=for-the-badge&logo=chroma&logoColor=31c4f3)

## 🚀 Full-Stack Portfolio: AI-Powered Django Deployment
A professional-grade portfolio featuring an **AI Chatbot** integrated with a **Vector Database**, containerized with **Docker**, and secured via **Cloudflare Zero Trust**.

## 🛡️ Infrastructure & Security
This project demonstrates modern **DevSecOps** and **AI Infrastructure**:

* **Cloudflare Tunnel:** The application is hosted behind a secure tunnel (`cloudflared`), keeping the server invisible to the public internet with **zero open inbound ports**.
* **Zero Trust Perimeter:** Outbound-only connectivity ensures high security for the AI application and its data.
* **WAF & DDoS Protection:** Leverages Cloudflare’s global network to mitigate common web attacks.

## 🏗️ Technical Stack
* **Backend:** Django 6.x / Python
* **AI Engine:** Integrated Chatbot with RAG (Retrieval-Augmented Generation)
* **Vector Database:** **ChromaDB** (for high-performance semantic search and document retrieval)
* **DevOps:** Docker, Docker Compose
* **Network:** Cloudflare Zero Trust, Tunneling

## ⚙️ Quick Start for Evaluators
To run this project locally, you only need Docker installed.

### 1. Clone the repository
```bash
git clone [https://github.com/adotbyte/resume_website.git](https://github.com/adotbyte/resume_website.git)
cd resume_website

### 2. Run with Docker Compose
```docker-compose up --build

### 3. Access the Application
The application will be available locally at: ```http://localhost:8000
