# TODO: Fix Admin Panel Not Reflecting Changes in Main Page

## Problem
The Admin panel uploads videos, announcements, and discussions, but changes do not reflect on the main page in production. This is because the serverless API functions (api/videos.js, api/announcements.js, api/discussions.js) only handle GET requests, while the Admin component sends POST/PUT/DELETE requests.

## Solution
Update the serverless functions to handle full CRUD operations, similar to server.js.

## Steps
- [x] Update api/videos.js to handle POST (create), PUT (update), DELETE (delete) for videos, persisting to data.json
- [x] Update api/announcements.js to handle POST (create), DELETE (delete) for announcements, persisting to announcements.json
- [x] Update api/discussions.js to handle POST (create), DELETE (delete) for discussions, persisting to discussions.json
- [x] Test Admin panel functionality after updates (server started successfully, loaded data from JSON files)
- [ ] Verify that changes reflect on main page immediately (requires manual testing in browser)
