import { Axiom } from '@axiomhq/js';
import { Logger, ConsoleTransport, AxiomJSTransport } from '@axiomhq/logging';
import { nextJsFormatters } from '@axiomhq/nextjs';

const axiomToken = process.env.NEXT_PUBLIC_AXIOM_TOKEN;
const axiomDataset = process.env.NEXT_PUBLIC_AXIOM_DATASET;

const transports = [];

if (axiomToken && axiomDataset) {
  const axiom = new Axiom({ token: axiomToken });
  transports.push(new AxiomJSTransport({ axiom, dataset: axiomDataset }));
}

// Console transport always present (local dev + Vercel function log fallback)
transports.push(
  new ConsoleTransport({ prettyPrint: process.env.NODE_ENV === 'development' })
);

export const logger = new Logger({
  transports: transports as [typeof transports[0], ...typeof transports],
  formatters: nextJsFormatters,
});
