import { describe, it, expect } from 'vitest';
import { buildICS, monthStartFromText } from '../src/lib/calendar.js';

describe('monthStartFromText', () => {
  it('reads the first named month from a range', () => {
    expect(monthStartFromText('Mar–Apr indoors')).toBe(3);
    expect(monthStartFromText('Late May–Jun')).toBe(5);
    expect(monthStartFromText('Oct or Feb–Mar')).toBe(10);
  });
  it('returns null when no month is named', () => {
    expect(monthStartFromText('—')).toBeNull();
    expect(monthStartFromText('Year-round')).toBeNull();
    expect(monthStartFromText('')).toBeNull();
  });
});

describe('buildICS', () => {
  const plan = { plantings: [{ plantId: 'tomato' }, { plantId: 'tomato' }, { plantId: 'garlic' }] };

  it('wraps events in a VCALENDAR with CRLF lines', () => {
    const ics = buildICS(plan, { year: 2026, now: '2026-01-01T00:00:00Z' });
    expect(ics.startsWith('BEGIN:VCALENDAR')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect(ics).toContain('\r\n');
  });
  it('emits sow and plant-out reminders for a sowable plant', () => {
    const ics = buildICS(plan, { year: 2026, now: '2026-01-01T00:00:00Z' });
    expect(ics).toContain('SUMMARY:Sow Tomato');
    expect(ics).toContain('SUMMARY:Plant out Tomato');
    expect(ics).toContain('RRULE:FREQ=YEARLY');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260301'); // tomato sows in March
  });
  it('skips timings that have no month (garlic has no sow month)', () => {
    const ics = buildICS(plan, { year: 2026, now: '2026-01-01T00:00:00Z' });
    expect(ics).not.toContain('SUMMARY:Sow Garlic');
    expect(ics).toContain('SUMMARY:Plant out Garlic'); // garlic plants Oct–Nov
  });
  it('produces no events for an empty plan', () => {
    const ics = buildICS({ plantings: [] });
    expect(ics).not.toContain('BEGIN:VEVENT');
  });
});
