🚀 Django Resume Website & Home Lab Infrastructure
This is more than just a CV website—it is a fully functional, secure, and containerized infrastructure running on my personal home server. This project was built to demonstrate my expertise in Full-stack development, DevOps principles, and Cybersecurity.

🛠 Technology Stack
Framework: Django (Python)

Frontend: JavaScript (ES6+), Bootstrap 5, HTML5/CSS3

Database: SQLite (Initial phase) / PostgreSQL (via Docker container)

Hardware: Raspberry Pi 5 (16GB RAM)

OS/Management: OpenMediaVault (OMV)

Virtualization: Docker & Docker Compose

Networking: Cloudflare (DNS, WAF, Proxy)

🔒 Security & Infrastructure (Security First)
A transparent and honest approach to security is my priority. I have achieved an A+ Rating on SecurityHeaders.com through rigorous configuration.

Content Security Policy (CSP): Implemented via custom Django Middleware to mitigate XSS (Cross-Site Scripting) risks.

Cloudflare Proxy & Tunneling: My home IP address is masked behind Cloudflare’s global network, utilizing WAF rules for added protection.

Docker Isolation: Each service (Web, DB, Nginx) runs in an isolated container environment.

SSL/TLS: Automated certificate management ensures end-to-end encrypted HTTPS traffic.

📂 Project Structure
Plaintext
├── core/                  # Django settings and security configuration
├── apps/                  # Modular applications (Resume, Projects, Blog)
├── static/                # CSS, JS, and assets
├── templates/             # Django HTML templates
├── docker-compose.yml     # Infrastructure-as-Code (IaC) definition
└── Dockerfile             # Instructions for the web application container
🧪 QA & Testing Methodology
As an aspiring Junior QA, I use this project as my primary testing ground:

Manual Testing: Extensive cross-browser testing (Chrome, Firefox, Safari) and mobile responsiveness checks.

Boundary Value Analysis: Input validation is enforced at both the Frontend (JS) and Backend (Django models/forms) levels.

Security Audits: Regular vulnerability scans based on OWASP principles to prevent SQLi and XSS.

Uptime Monitoring: Leveraging OMV and Docker logs to ensure 24/7 service availability.

🚀 Local Development Setup
Clone the repository:

Bash
git clone https://github.com/your-username/resume-project.git
Run with Docker Compose:

Bash
docker-compose up --build
Access the site:
The application will be available at http://localhost:8000

💡 Contact Me
I am a curious, communicative, and highly motivated individual looking for new challenges in the IT sector. If you value quality, transparency, and technical integrity, let’s connect!