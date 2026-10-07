const {test} = require('node:test');
const assert = require('node:assert/strict');
const {check, today, holidays} = require('../nyc-parking/calendar.js');
test('all 42 published dates are scheduled suspensions', () => {
  assert.equal(Object.keys(holidays).length,42);
  for (const day of Object.keys(holidays)) assert.equal(check('2026-'+day).kind,'holiday');
});
test('ordinary day does not claim live enforcement', () => { assert.equal(check('2026-10-07').kind,'regular'); assert.match(check('2026-10-07').description,/Weather or emergency/); });
test('Sunday exception', () => assert.equal(check('2026-10-11').kind,'sunday'));
test('major holiday and ordinary suspension have distinct meter guidance', () => { assert.match(check('2026-12-25').description,/major-holiday meter/); assert.match(check('2026-10-12').description,/Do not assume meters/); });
test('other years never reuse 2026', () => { for(const day of ['2025-12-25','2027-01-01']) assert.equal(check(day).kind,'unavailable'); });
test('invalid and empty dates fail safely', () => { for(const day of ['',null,'2026-02-30','2026-13-01','bad']) assert.equal(check(day).kind,'invalid'); });
test('calendar defaults to New York even across UTC midnight', () => assert.equal(today(new Date('2026-10-08T02:00:00Z')),'2026-10-07'));
