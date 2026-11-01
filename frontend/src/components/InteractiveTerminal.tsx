'use client';
import 'xterm/css/xterm.css';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

export default function InteractiveTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Kad išvengtume hidratacijos klaidos, komponentą rodome tik po užkrovimo
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let term: any;
    const isDark = resolvedTheme === 'dark';

    const initTerminal = async () => {
      const container = terminalRef.current;
      if (!container) return;

      const { Terminal } = await import('xterm');

      term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
        theme: isDark
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
            },
        fontSize: 14,
        fontFamily: '"Fira Code", "Cascadia Code", "Courier New", monospace',
        allowTransparency: false,
      });

      term.open(container);
      term.clear();
      term.write('\x1b[2J\x1b[H');
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
    };

    initTerminal();

    return () => {
      if (term) term.dispose();
    };
  }, [mounted, resolvedTheme]); // <-- Priklausomybėse nurodome temą

  if (!mounted) return null;

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#0d1117]">
      <div ref={terminalRef} className="h-[500px] w-full p-4" />
    </div>
  );
}

async function handleCommand(term: any, cmd: string) {
  const command = cmd.toLowerCase();

  switch (command) {
    case 'help':
    case 'pagalba':
      term.write('Available commands / Galimos komandos:\r\n');
      term.write('  about / apie      - Learn about me / Sužinokite apie mane\r\n');
      term.write('  skills            - List my technical skills / Mano technologijos\r\n');
      term.write('  projects          - Show my featured projects / Projektai\r\n');
      term.write('  contact           - How to get in touch / Kontaktai\r\n');
      term.write('  docker ps         - List running containers / Veikiantys konteineriai\r\n');
      term.write('  uptime            - Show system uptime / Veikimo laikas\r\n');
      term.write('  free -h           - Show memory usage / Atminties naudojimas\r\n');
      term.write('  clear             - Clear the terminal / Išvalyti terminalą\r\n');
      break;

    case 'docker ps':
      term.write('Fetching containers...\r\n');
      try {
        const res = await fetch('/api/system/docker-ps');
        const data = await res.json();
        if (data.containers?.length) {
          term.write('CONTAINER ID   IMAGE                          STATUS          NAMES\r\n');
          data.containers.forEach((c: any) => {
            term.write(
              `${c.name.padEnd(15)} ${c.image.padEnd(30)} ${c.status.padEnd(15)} ${c.name}\r\n`
            );
          });
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
          term.write(` up ${data.days} days, ${data.hours} hours\r\n`);
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
          term.write('               total        used        free\r\n');
          term.write(
            `Mem:            ${data.total.toFixed(1)}Gi       ${data.used.toFixed(1)}Gi       ${data.free.toFixed(1)}Gi\r\n`
          );
        } else {
          term.write('Error fetching memory.\r\n');
        }
      } catch {
        term.write('Error fetching memory.\r\n');
      }
      term.scrollToBottom();
      break;

    case 'about':
    case 'apie':
      term.write("Hi! I'm Audrius Morkūnas, a self-taught infrastructure enthusiast.\r\n");
      term.write('I build stable, secure systems from the server-side down.\r\n\r\n');
      term.write('Sveiki! Aš esu Audrius Morkūnas, savamokslis infrastruktūros entuziastas.\r\n');
      term.write('Kuriu stabilias, saugias sistemas nuo serverio pusės žemyn.\r\n');
      break;

    case 'skills':
      term.write('My tech stack:\r\n');
      term.write('  - Infrastructure: Linux, Docker, Nginx\r\n');
      term.write('  - Backend: Django, Python, PostgreSQL\r\n');
      term.write('  - Frontend: Next.js, React, Tailwind CSS\r\n');
      break;

    case 'projects':
      term.write('Featured projects:\r\n');
      term.write('  1. AI-Powered Portfolio (this site!)\r\n');
      term.write('  2. Self-Hosted Home Lab (Raspberry Pi 5)\r\n');
      term.write('  3. AI-Powered Knowledge Base\r\n');
      break;

    case 'contact':
      term.write('You can reach me via:\r\n');
      term.write('  - Email: audrius@morkunas.info\r\n');
      term.write('  - LinkedIn: linkedin.com/in/audrius-morkunas-939a2581\r\n');
      term.write('  - GitHub: github.com/adotbyte\r\n');
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
