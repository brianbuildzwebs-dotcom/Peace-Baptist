import {
  filterCustomFormSubmissions,
  filterValidSubmissions,
  isCustomFormSubmission,
  isOrphanedSubmission,
} from '../server/lib/formSubmissions.js';

const activeForms = new Set(['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa']);
const activeEvents = new Set(['eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee']);

const rows = [
  { id: '1', form_id: 'default_rsvp', event_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' },
  { id: '2', form_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
  { id: '3', form_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' },
  { id: '4', form_id: 'default_rsvp', event_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff' },
];

const filtered = filterValidSubmissions(rows, activeForms, activeEvents);
console.assert(filtered.length === 2, 'expected 2 valid submissions');
console.assert(isOrphanedSubmission(rows[2], activeForms, activeEvents), 'expected deleted-form orphan');
console.assert(isOrphanedSubmission(rows[3], activeForms, activeEvents), 'expected deleted-event orphan');
console.assert(isCustomFormSubmission(rows[1], activeForms), 'expected custom form submission');
console.assert(filterCustomFormSubmissions(rows, activeForms).length === 1, 'expected one custom form row');
console.log('form submission filter tests passed');