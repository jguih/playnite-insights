# Backlog

## ✅ Done

- Sync Playnite library metadata
- Sync Playnite library media files
- Home page and main application layout
- Automatically create and update manifest.json that contains data about what the server currently have
- Serve the manifest.json through the API
- Include a content hash in the manifest for media files
- Display basic game info in game page
- Save scroll prosition when navigating away from home page
- Pagination
- Save games in SQLite database
- View model for home page
- Data streaming in home page
- Data streaming in dashboard page
- API Integration testing
- Data streaming in game page
- Game filtering
- Game sorting
- Game session
- Fix: Orphan sessions on game delete
- Fix: Media files being deleted even when game delete fails
- Dashboard page
- Bottom nav improvements
- Active session page:
  - Display current game being played
  - Allow user to manage notes linked to the current session
- Screenshot gallery improvements:
  - Store metadata in database
  - Compare image hashes to avoid duplicates
- Improve home page performance by caching filtered game list instead of recomputing on every render
- Instance authentication system

## 🛠️ In Progress

- Screenshot gallery improvements:
  - Delete images
  - Restore images from trash
- Syncronization safety with Sync Id:
  - Client and server keeps the same sync id. Client send it on every sync request.
  - As long as client's sync id = server's sync id, the client is the source of truth and will overwrite server's data on every sync (last write wins).
  - On a server reset, either trigger manually through the UI or by completly wiping out all server data, where a new sync id will be generated, causing a mismatch, the server becomes the source of truth and all local data will be overwritten.

## 📌 To Do

- Display game trailer in game page
- Display related owned games in game page
- Settings page:
  - Global filter to hide hidden games
  - Option to automatically redirect to current active game journal when a session is in progress
- Authentication system for ShareX integration endpoint /api/assets/upload/screenshot

## 💡 Ideas

- Create a recomendation system that recommends both owned and not owned games
- Allow remotely opening games from the Web UI
