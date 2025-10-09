# Syncing Across Devices

PlayAtlas stores all user-managed data, like notes and application settings, locally first. In addition, any data that is required for the app to function is cached and available offline. That means you can keep using PlayAtlas regardless of your network connection.

Periodically, PlayAtlas syncs your local data with the server, allowing you to continue where you left on any device.

## Getting Started

Data synchronization is always active and setup automatically by both client and server. No additional steps are required.

## What is a 'SyncId' ?

A **synchronization id** is a unique value shared between your PlayAtlas server and all of its clients. It's used by both client and server to determine if they're in sync with each other.

A SyncId is issued the first time the PlayAtlas server is started and shared with all clients. It is immutable by design and can only be changed manually through a server reset.

When the client attempts to create or update an entity that requires synchronization, it must send a valid SyncId. The **server** then:

- Rejects the request if the received SyncId doesn't match its own.
- Or, If the server's SyncId is the same as the one sent by the client, accepts the request and persists the received entity in the database, overwriting any existing entity with same id.

The client keeps the last known SyncId in its local database and includes it on every request. It also checks with the server if both have the same SyncId before attempting synchronization. After getting a response from the server, the **client** will:

- Synchronize any queued pending changes with the server.
- Or, when the server responds with code 409 (conflict), will initiate a reconciliation, sending it's entire dataset state to the server.

When the client requests a reconciliation, both client and server exchange their current dataset states and merge any pending changes using the '**last write wins**' strategy. In addition, the server shares it's SyncId with the client. This ensures that the server and all clients remain in sync, even if a client or the server database is lost or wiped.
