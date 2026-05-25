// Build an iCalendar (.ics) feed of seasonal reminders from a garden plan.
// Each distinct planted variety yields yearly-recurring all-day reminders for
// when to sow and when to plant out, derived from the free-text timing fields
// in the plant library. Pure: returns a string, touches no DOM or network.
import { PLANTS_BY_ID } from '../data/plants.js';
import { MONTHS } from './util.js';

/** First month named in a free-text timing string ("Late May–Jun" -> 5), or null. */
export function monthStartFromText(text) {
  if (!text || text === '—') return null;
  let best = null;
  for (let i = 0; i < MONTHS.length; i++) {
    const idx = text.indexOf(MONTHS[i]);
    if (idx !== -1 && (best === null || idx < best.idx)) best = { idx, month: i + 1 };
  }
  return best ? best.month : null;
}

// Escape per RFC 5545 text rules.
const escText = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const pad = (n) => String(n).padStart(2, '0');

function vevent({ uid, stamp, year, month, summary, description }) {
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${year}${pad(month)}01`,
    'RRULE:FREQ=YEARLY',
    `SUMMARY:${escText(summary)}`,
    `DESCRIPTION:${escText(description)}`,
    'END:VEVENT',
  ];
}

/** A VCALENDAR string of sow/plant-out reminders for everything in the plan. */
export function buildICS(state, opts = {}) {
  const now = opts.now ? new Date(opts.now) : new Date();
  const year = opts.year || now.getFullYear();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const counts = {};
  for (const p of state.plantings || []) counts[p.plantId] = (counts[p.plantId] || 0) + 1;

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Magic Garden//UK Garden Planner//EN', 'CALSCALE:GREGORIAN'];
  for (const [id, n] of Object.entries(counts)) {
    const plant = PLANTS_BY_ID[id];
    if (!plant) continue;
    const qty = `${n}× in your plan. ${plant.tip}`;
    const sowMonth = monthStartFromText(plant.sow);
    if (sowMonth) lines.push(...vevent({ uid: `sow-${id}@magic-garden`, stamp, year, month: sowMonth, summary: `Sow ${plant.name}`, description: `${plant.sow}. ${qty}` }));
    const plantMonth = monthStartFromText(plant.plant);
    if (plantMonth) lines.push(...vevent({ uid: `plant-${id}@magic-garden`, stamp, year, month: plantMonth, summary: `Plant out ${plant.name}`, description: `${plant.plant}. ${qty}` }));
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
