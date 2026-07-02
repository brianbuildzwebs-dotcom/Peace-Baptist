import {
  filterValidSubmissions,
  isOrphanedSubmission,
} from '../server/lib/formSubmissions.js';

const active = new Set(['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']);

const rows = [
  { id: '1', form_id: 'default_rsvp' },
  { id: '2', form_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
  { id: '3', form_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
];

const filtered = filterValidSubmissions(rows, active);
console.assert(filtered.length === 2, 'expected 2 valid submissions');
console.assert(isOrphanedSubmission(rows[2], active), 'expected orphan');
console.log('form submission filter tests passed');