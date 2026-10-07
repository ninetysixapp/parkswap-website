/* NYC311 published 2026 calendar, verified 2026-10-07. Static schedule only.
 * Source: https://portal.311.nyc.gov/article/?kanumber=KA-01011
 * No external calls, location collection, cookies, or emergency-status inference. */
(function (root) {
  'use strict';
  const holidays = Object.freeze({
    '01-01': "New Year's Day", '01-06': "Three Kings' Day", '01-19': 'Martin Luther King, Jr. Day',
    '02-12': "Lincoln's Birthday", '02-16': "Washington's Birthday / Lunar New Year's Eve", '02-17': 'Lunar New Year', '02-18': 'Ash Wednesday / Losar',
    '03-03': 'Purim', '03-20': 'Eid Al-Fitr', '03-21': 'Eid Al-Fitr',
    '04-02': 'Holy Thursday / Passover', '04-03': 'Good Friday / Passover', '04-08': 'Passover', '04-09': 'Passover / Orthodox Holy Thursday', '04-10': 'Orthodox Good Friday',
    '05-14': 'Ascension', '05-22': 'Shavuot', '05-23': 'Shavuot', '05-25': 'Memorial Day', '05-27': 'Eid Al-Adha', '05-28': 'Eid Al-Adha',
    '06-19': 'Juneteenth', '07-03': 'Independence Day (observed)', '07-04': 'Independence Day', '07-23': "Tisha B'Av", '08-15': 'Assumption',
    '09-07': 'Labor Day', '09-12': 'Rosh Hashanah', '09-13': 'Rosh Hashanah', '09-21': 'Yom Kippur', '09-26': 'Sukkot', '09-27': 'Sukkot',
    '10-03': 'Shemini Atzeret', '10-04': 'Simchas Torah', '10-12': "Italian Heritage Day / Indigenous Peoples' Day", '11-01': "All Saints' Day", '11-03': 'Election Day', '11-08': 'Diwali', '11-11': 'Veterans Day', '11-26': 'Thanksgiving Day', '12-08': 'Immaculate Conception', '12-25': 'Christmas Day'
  });
  const major = new Set(['01-01', '05-25', '07-03', '07-04', '09-07', '11-26', '12-25']);
  function check(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return {kind:'invalid', title:'Choose a valid date', description:'Use the date field to check the published calendar.'};
    const date = new Date(value + 'T12:00:00Z');
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== value) return {kind:'invalid', title:'Choose a valid date', description:'This date is not valid.'};
    if (value.slice(0,4) !== '2026') return {kind:'unavailable', title:"This year's calendar is not loaded", description:'The checker only contains 2026. Check the current official NYC311 calendar; we will not reuse a different year’s dates.'};
    const key = value.slice(5);
    if (holidays[key]) return {kind:'holiday', title:'Scheduled ASP suspension', description:holidays[key] + '. Street-cleaning rules are scheduled to be suspended citywide. ' + (major.has(key) ? 'NYC311 also lists a major-holiday meter exception. ' : date.getUTCDay() === 0 ? 'The usual Sunday meter exception also applies. ' : 'Do not assume meters are suspended. ') + 'Confirm current notices and other restrictions with NYC311.'};
    if (date.getUTCDay() === 0) return {kind:'sunday', title:'Sunday: ASP not in effect', description:'The usual Sunday ASP and meter exceptions apply. Other restrictions still matter. Check signs and current NYC311 notices.'};
    return {kind:'regular', title:'No holiday suspension listed', description:'The published calendar lists no suspension for this date. Weather or emergency changes may still occur. Confirm with NYC311 and follow posted cleaning hours.'};
  }
  function today(now) {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const get = kind => parts.find(part => part.type === kind).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {check, today, holidays};
  if (!root.document) return;
  const input = root.document.getElementById('parking-date');
  const result = root.document.getElementById('calendar-result');
  if (!input || !result) return;
  function render() {
    const status = check(input.value);
    result.querySelector('h3').textContent = status.title;
    result.querySelector('p').textContent = status.description;
    result.dataset.status = status.kind;
  }
  input.value = today(new Date());
  input.addEventListener('change', render);
  input.addEventListener('input', render);
  render();
})(typeof window === 'undefined' ? {} : window);
