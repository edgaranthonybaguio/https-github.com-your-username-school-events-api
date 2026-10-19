const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000; // Render supplies PORT; 3000 is the local fallback

// Parse JSON request bodies
app.use(express.json());

// ---- In-memory data store (temporary) ----
let events = [
  { id: 1, title: 'Intramurals Opening', date: '2026-11-05', location: 'School Gym', organizer: 'Student Council' },
  { id: 2, title: 'Coding Workshop', date: '2026-11-12', location: 'Computer Lab 1', organizer: 'CCS Organization' },
  { id: 3, title: 'Leadership Seminar', date: '2026-11-20', location: 'Auditorium', organizer: 'Student Affairs' }
];
let nextId = 4;

// ---- Helpers ----
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isValidDate = (v) =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// Validates a body. When partial=true, only supplied fields are checked.
function validateEvent(body, partial = false) {
  const errors = [];
  const rules = {
    title: [isNonEmptyString, 'title must be a non-empty string'],
    date: [isValidDate, 'date must be a valid date in YYYY-MM-DD format'],
    location: [isNonEmptyString, 'location must be a non-empty string'],
    organizer: [isNonEmptyString, 'organizer must be a non-empty string']
  };
  for (const [field, [check, message]] of Object.entries(rules)) {
    if (body[field] === undefined) {
      if (!partial) errors.push(`${field} is required`);
    } else if (!check(body[field])) {
      errors.push(message);
    }
  }
  if (partial && !Object.keys(rules).some((f) => body[f] !== undefined)) {
    errors.push('provide at least one of: title, date, location, organizer');
  }
  return errors;
}

// Validates :id and finds the event. Sends the error response itself if it fails.
function findEvent(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ success: false, message: 'ID must be a positive integer' });
    return null;
  }
  const event = events.find((e) => e.id === id);
  if (!event) {
    res.status(404).json({ success: false, message: `Event with ID ${id} not found` });
    return null;
  }
  return event;
}

const pick = (b) => ({ title: b.title?.trim(), date: b.date, location: b.location?.trim(), organizer: b.organizer?.trim() });

// ---- Routes ----

// Root status route (makes deployment easy to verify)
app.get('/', (req, res) => {
  res.json({ status: 'running', message: 'School Events API is live', endpoints: '/api/events' });
});

// READ all
app.get('/api/events', (req, res) => {
  res.status(200).json({ success: true, count: events.length, data: events });
});

// READ one
app.get('/api/events/:id', (req, res) => {
  const event = findEvent(req, res);
  if (!event) return;
  res.status(200).json({ success: true, data: event });
});

// CREATE
app.post('/api/events', (req, res) => {
  const errors = validateEvent(req.body || {});
  if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

  const newEvent = { id: nextId++, ...pick(req.body) };
  events.push(newEvent);
  res.status(201).json({ success: true, message: 'Event created', data: newEvent });
});

// UPDATE (full replace) - all fields required
app.put('/api/events/:id', (req, res) => {
  const event = findEvent(req, res);
  if (!event) return;
  const errors = validateEvent(req.body || {});
  if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

  Object.assign(event, pick(req.body));
  res.status(200).json({ success: true, message: 'Event updated', data: event });
});

// UPDATE (partial) - only supplied fields change
app.patch('/api/events/:id', (req, res) => {
  const event = findEvent(req, res);
  if (!event) return;
  const body = req.body || {};
  const errors = validateEvent(body, true);
  if (errors.length) return res.status(400).json({ success: false, message: 'Validation failed', errors });

  for (const [k, v] of Object.entries(pick(body))) {
    if (v !== undefined) event[k] = v;
  }
  res.status(200).json({ success: true, message: 'Event updated', data: event });
});

// DELETE
app.delete('/api/events/:id', (req, res) => {
  const event = findEvent(req, res);
  if (!event) return;
  events = events.filter((e) => e.id !== event.id);
  res.status(200).json({ success: true, message: `Event ${event.id} deleted`, data: event });
});

// ---- Error handling ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
