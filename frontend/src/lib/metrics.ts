// src/lib/metrics.ts
import { Registry, Counter, Gauge } from '@prometheus-io/client';

// Sukuriame globalų registrą
export const register = new Registry();

// Metrika: kiek žinučių iš viso gauta
export const chatMessagesTotal = new Counter({
  name: 'portfolio_chat_messages_total',
  help: 'Total number of chat messages received',
  labelNames: ['role'], // 'user' arba 'ai'
  registers: [register],
});

// Metrika: kiek el. laiškų išsiųsta
export const emailsSentTotal = new Counter({
  name: 'portfolio_emails_sent_total',
  help: 'Total number of emails sent via chatbot',
  registers: [register],
});

// Metrika: dabartinis DB įrašų skaičius (galima atnaujinti periodiškai)
export const dbMessagesCount = new Gauge({
  name: 'portfolio_db_messages_count',
  help: 'Current number of messages in the database',
  registers: [register],
});
