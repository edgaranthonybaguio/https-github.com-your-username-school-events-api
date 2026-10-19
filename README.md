# School Events API

A RESTful API built with **Express.js** for managing school organization events.
Made for ITPE101 – Integrative Programming & Technology (Laboratory Activity).

## Technologies Used
- Node.js
- Express.js
- Postman (testing)
- GitHub (source control)
- Render (deployment)

## Installation and Local Execution
```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd school-events-api
npm install
npm start        # or: node server.js
```
The server runs at `http://localhost:3000` (or the port in `process.env.PORT`).

## Event Fields
| Field | Type | Rule |
|-------|------|------|
| id | number | auto-generated |
| title | string | required, non-empty |
| date | string | required, `YYYY-MM-DD` |
| location | string | required, non-empty |
| organizer | string | required, non-empty |

## Endpoints
| Method | Route | Purpose | Success Code |
|--------|-------|---------|--------------|
| GET | `/` | API status check | 200 |
| GET | `/api/events` | Retrieve all events | 200 |
| GET | `/api/events/:id` | Retrieve one event | 200 |
| POST | `/api/events` | Create an event | 201 |
| PUT | `/api/events/:id` | Replace an event (all fields required) | 200 |
| PATCH | `/api/events/:id` | Update only the supplied fields | 200 |
| DELETE | `/api/events/:id` | Delete an event | 200 |

Error codes: `400` (validation error / invalid ID / bad JSON), `404` (event or route not found), `500` (server error).

## Example Request Body (POST /api/events)
```json
{
  "title": "Sports Fest",
  "date": "2026-12-01",
  "location": "School Oval",
  "organizer": "PE Department"
}
```

## Links
- GitHub Repository: https://github.com/your-username/school-events-api
- Render Deployment: https://your-service-name.onrender.com

## Known Limitations
- Data is stored in an **in-memory array**, so it is temporary. Records reset whenever the server restarts or the Render instance is replaced/spun down.
- No authentication or database.
- Render's free tier may take ~50 seconds to wake up on the first request after idling.
