export const startOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
export const endOfDay = (d = new Date()) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
export function workingDays(start, end, holidays = []) {
  let count = 0; const holidaySet = new Set(holidays.map(h => new Date(h).toISOString().slice(0,10)));
  const d = new Date(start); d.setHours(0,0,0,0);
  const last = new Date(end); last.setHours(0,0,0,0);
  while (d <= last) {
    const day = d.getDay(), key = d.toISOString().slice(0,10);
    if (day !== 0 && day !== 6 && !holidaySet.has(key)) count++;
    d.setDate(d.getDate()+1);
  }
  return count;
}
