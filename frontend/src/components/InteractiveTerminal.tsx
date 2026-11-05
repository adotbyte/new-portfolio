'use client';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function InteractiveTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termInstanceRef = useRef<any>(null); // <-- Išsaugome terminalo instanciją
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Terminalo sukūrimas (tik vieną kartą)
  useEffect(() => {
    if (!mounted) return;

    let resizeObserver: ResizeObserver | null = null;

    const initTerminal = async () => {
      const container = terminalRef.current;
      if (!container) return;

      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');

      // Sukuriame terminalą su pradine tema
      const term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
        theme: {
          background: '#0d1117',
          foreground: '#c9d1d9',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
        },
        fontSize: 14,
        fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
        allowTransparency: false,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(container);
      fitAddon.fit();

      resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(container);

      // Pradinis tekstas
      term.write("Welcome to Audrius's Portfolio Terminal\r\n");
      term.write('Type "help" to see available commands.\r\n\r\n');
      term.write('$ ');

      let currentLine = '';

      term.onData(async (data: string) => {
        const code = data.charCodeAt(0);

        if (code === 13) {
          term.write('\r\n');
          await handleCommand(term, currentLine.trim());
          currentLine = '';
          term.write('$ ');
        } else if (code === 127) {
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
          }
        } else if (code >= 32 && code <= 126) {
          currentLine += data;
          term.write(data);
        }
      });

      termInstanceRef.current = term; // Išsaugome instanciją
    };

    initTerminal();

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (termInstanceRef.current) {
        termInstanceRef.current.dispose();
        termInstanceRef.current = null;
      }
    };
  }, [mounted]); // <-- Priklausomybėse TIK mounted

  // 2. Temos keitimas (be terminalo perkūrimo)
  useEffect(() => {
    if (!termInstanceRef.current) return;

    const isDark = resolvedTheme === 'dark';

    termInstanceRef.current.options.theme = isDark
      ? {
          background: '#0d1117',
          foreground: '#c9d1d9',
          cursor: '#58a6ff',
          cursorAccent: '#0d1117',
        }
      : {
          background: '#ffffff',
          foreground: '#1f2937',
          cursor: '#2563eb',
          cursorAccent: '#ffffff',
        };
  }, [resolvedTheme]);

  if (!mounted) return null;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#0d1117]">
      <div
        ref={terminalRef}
        className="h-[500px] w-full max-w-full touch-pan-y overflow-hidden p-4 pb-4 md:pb-4"
      />
    </div>
  );
}

function writeResponsive(term: any, text: string, maxWidthMobile = 40, maxWidthDesktop = 80) {
  const isMobile = window.innerWidth < 768;
  const maxWidth = isMobile ? maxWidthMobile : maxWidthDesktop;

  const words = text.split(' ');
  let line = '';

  for (const word of words) {
    if (word.length > maxWidth) {
      if (line) {
        term.write(line + '\r\n');
        line = '';
      }
      term.write(word.slice(0, maxWidth - 3) + '...\r\n');
      continue;
    }

    if ((line + ' ' + word).length > maxWidth) {
      term.write(line + '\r\n');
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }

  if (line) {
    term.write(line + '\r\n');
  }
}

async function handleCommand(term: any, cmd: string) {
  const command = cmd.toLowerCase();

  switch (command) {
    case 'help':
    case 'pagalba':
      writeResponsive(term, 'Available commands / Galimos komandos:', 40, 80);
      writeResponsive(term, '  about / apie      - Learn about me / Sužinokite apie mane');
      writeResponsive(term, '  skills            - List my technical skills / Mano technologijos');
      writeResponsive(term, '  projects          - Show my featured projects / Projektai');
      writeResponsive(term, '  contact           - How to get in touch / Kontaktai');
      writeResponsive(
        term,
        '  docker ps         - List running containers / Veikiantys konteineriai'
      );
      writeResponsive(term, '  uptime            - Show system uptime / Veikimo laikas');
      writeResponsive(term, '  free -h           - Show memory usage / Atminties naudojimas');
      writeResponsive(term, '  neofetch          - Display system info / Sistemos informacija\r\n');
      writeResponsive(term, '  matrix            - Enter the Matrix / Patekti į Matricą\r\n');
      writeResponsive(term, '  clear             - Clear the terminal / Išvalyti terminalą');
      term.scrollToBottom();
      break;

    case 'docker ps':
      term.write('Fetching containers...\r\n');
      try {
        const res = await fetch('/api/system/docker-ps');
        const data = await res.json();
        if (data.containers?.length) {
          const isMobile = window.innerWidth < 768;

          if (isMobile) {
            term.write('NAME'.padEnd(18) + 'IMAGE'.padEnd(22) + 'STATUS\r\n');
            data.containers.forEach((c: any) => {
              const name = c.name.length > 16 ? c.name.slice(0, 13) + '...' : c.name;
              const image = c.image.length > 20 ? c.image.slice(0, 17) + '...' : c.image;
              term.write(`${name.padEnd(18)} ${image.padEnd(22)} ${c.status}\r\n`);
            });
          } else {
            term.write('CONTAINER ID   IMAGE                          STATUS          NAMES\r\n');
            data.containers.forEach((c: any) => {
              term.write(
                `${c.name.padEnd(15)} ${c.image.padEnd(30)} ${c.status.padEnd(15)} ${c.name}\r\n`
              );
            });
          }
        } else {
          term.write('No containers running.\r\n');
        }
      } catch {
        term.write('Error fetching containers.\r\n');
      }
      term.scrollToBottom();
      break;

    case 'uptime':
      term.write('Fetching uptime...\r\n');
      try {
        const res = await fetch('/api/system/uptime');
        const data = await res.json();
        if (data.days !== undefined) {
          term.write(` up ${data.days}d ${data.hours}h, load: ${data.load}\r\n`);
        } else {
          term.write('Error fetching uptime.\r\n');
        }
      } catch {
        term.write('Error fetching uptime.\r\n');
      }
      term.scrollToBottom();
      break;

    case 'free -h':
      term.write('Fetching memory usage...\r\n');
      try {
        const res = await fetch('/api/system/free');
        const data = await res.json();
        if (data.total !== undefined) {
          const isMobile = window.innerWidth < 768;

          if (isMobile) {
            term.write(`Total: ${data.total.toFixed(1)}Gi\r\n`);
            term.write(`Used:  ${data.used.toFixed(1)}Gi\r\n`);
            term.write(`Free:  ${data.free.toFixed(1)}Gi\r\n`);
          } else {
            term.write('               total        used        free\r\n');
            term.write(
              `Mem:            ${data.total.toFixed(1)}Gi       ${data.used.toFixed(1)}Gi       ${data.free.toFixed(1)}Gi\r\n`
            );
          }
        } else {
          term.write('Error fetching memory.\r\n');
        }
      } catch {
        term.write('Error fetching memory.\r\n');
      }
      term.scrollToBottom();
      break;

    case 'neofetch':
      term.write('Fetching system info...\r\n');
      try {
        const isMobile = window.innerWidth < 768;

        const [uptimeRes, freeRes] = await Promise.all([
          fetch('/api/system/uptime'),
          fetch('/api/system/free'),
        ]);
        const uptimeData = await uptimeRes.json();
        const freeData = await freeRes.json();

        const asciiArt = isMobile
          ? ['   .-,', '  /   \\', ' |     |', '  \\   /', '   `-`']
          : ['    .-"-".', '   /     \\', '  |       |', '  |       |', '   \\     /', '    `-.-`'];

        const info = [
          'audrius@raspberrypi',
          '-------------------',
          `OS: Raspberry Pi OS (64-bit)`,
          `Host: Raspberry Pi 5 (16GB)`,
          `Uptime: ${uptimeData.days || 0} days, ${uptimeData.hours || 0} hours`,
          `Memory: ${freeData.used?.toFixed(1) || '?'}Gi / ${freeData.total?.toFixed(1) || '?'}Gi`,
          `Load: ${uptimeData.load || 'N/A'}`,
        ];

        const maxLines = Math.max(asciiArt.length, info.length);
        for (let i = 0; i < maxLines; i++) {
          const artLine = (asciiArt[i] || '').padEnd(isMobile ? 12 : 16);
          const infoLine = info[i] || '';
          term.write(`${artLine} ${infoLine}\r\n`);
        }
      } catch {
        term.write('Error fetching system info.\r\n');
      }
      term.scrollToBottom();
      break;

    case 'matrix':
      term.write('Entering the Matrix...\r\n');
      await new Promise<void>((resolve) => {
        const chars =
          '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
        const isMobile = window.innerWidth < 768;
        const width = isMobile ? 40 : 80;
        const height = isMobile ? 15 : 24;
        let frames = 0;
        const maxFrames = 20;

        const interval = setInterval(() => {
          term.write('\x1b[2J\x1b[H');
          for (let y = 0; y < height; y++) {
            let line = '';
            for (let x = 0; x < width; x++) {
              line += Math.random() > 0.85 ? chars[Math.floor(Math.random() * chars.length)] : ' ';
            }
            term.write(`\x1b[32m${line}\x1b[0m\r\n`);
          }
          frames++;
          if (frames >= maxFrames) {
            clearInterval(interval);
            term.write('\x1b[2J\x1b[H');
            term.write('Welcome back to reality.\r\n');
            resolve();
          }
        }, 150);
      });
      term.scrollToBottom();
      break;

    case 'about':
    case 'apie':
      writeResponsive(term, "Hi! I'm Audrius Morkūnas, a self-taught infrastructure enthusiast.");
      writeResponsive(term, 'I build stable, secure systems from the server-side down.');
      writeResponsive(term, '');
      writeResponsive(
        term,
        'Sveiki! Aš esu Audrius Morkūnas, savamokslis infrastruktūros entuziastas.'
      );
      writeResponsive(term, 'Kuriu stabilias, saugias sistemas nuo serverio pusės žemyn.');
      term.scrollToBottom();
      break;

    case 'skills':
      writeResponsive(term, 'My tech stack:');
      writeResponsive(term, '  - Infrastructure: Linux, Docker, Nginx');
      writeResponsive(term, '  - Backend: Django, Python, PostgreSQL');
      writeResponsive(term, '  - Frontend: Next.js, React, Tailwind CSS');
      term.scrollToBottom();
      break;

    case 'projects':
      writeResponsive(term, 'Featured projects:');
      writeResponsive(term, '  1. AI-Powered Portfolio (this site!)');
      writeResponsive(term, '  2. Self-Hosted Home Lab (Raspberry Pi 5)');
      writeResponsive(term, '  3. AI-Powered Knowledge Base');
      term.scrollToBottom();
      break;

    case 'contact':
      writeResponsive(term, 'You can reach me via:');
      writeResponsive(term, '  - Email: audrius@morkunas.info');
      writeResponsive(term, '  - LinkedIn: linkedin.com/in/audrius-morkunas-939a2581');
      writeResponsive(term, '  - GitHub: github.com/adotbyte');
      term.scrollToBottom();
      break;

    case 'clear':
      term.clear();
      break;

    case '':
      break;

    default:
      term.write(`Command not found: ${cmd}\r\n`);
      term.write('Type "help" for available commands.\r\n');
  }
}
