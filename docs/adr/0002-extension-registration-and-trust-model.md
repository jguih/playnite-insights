# ADR-0002: Extension registration and trust model

## Status

**✅ Accepted**: 2026-03-03

## Context

PlayAtlas is designed as a self-hosted LAN application.

It runs in a trusted local network and assumes the following machines are trusted:

- The Linux host running the PlayAtlas server
- The Windows machine running Playnite + Exporter
- Browsers accessing the web interface from the same LAN

The system does not implement a hardened internet-facing authentication model and must not be exposed directly to the public internet.

Within this environment:

- The Playnite Exporter acts as a client to the PlayAtlas server.
- The server must not automatically trust any exporter that knows its address.
- The exporter assumes the server address provided by the user is valid.

The system must ensure that:

- No exporter can upload or modify data without explicit user approval.
- Knowing the server address alone is insufficient to gain access.
- Trust is explicitly granted by the server through user interaction.

## Decision

PlayAtlas implements an explicit approval-based trust model for exporter registration.

### Registration flow

When the user requests registration from the Exporter configuration screen, the extension sends a registration request containing:

- `ExtensionId`
- `PublicKey`
- Optional device metadata (Hostname, OS, ExtensionVersion)

The server receives this request and registers the exporter as **pending**.

The request becomes visible in the PlayAtlas web UI.

### Explicit user approval

The user must log in to PlayAtlas and approve the pending exporter.

- The approval screen is accessible through the client UI.
- The approval API endpoint requires a valid authenticated session.
- Approval can only occur after successful user authentication.

Until approved, the exporter cannot:

- Upload game data
- Modify stored information
- Trigger synchronization
- Establish a Server-Sent Events (SSE) connection

After approval:

- The exporter may establish an SSE connection.
- The exporter may send HTTP requests to upload metadata and session data.

### Trust direction

Trust is established by the server, not by the exporter.

- The exporter blindly trusts the server address provided by the user.
- The server does not trust the exporter until explicitly approved.

Providing a valid server URL to the exporter is considered user consent and responsibility.

The server enforces a zero-trust rule inside the LAN:

Every exporter must be explicitly approved before interaction is allowed.

## Consequences

### Positive

- Knowing the server address alone does not grant access.
- Explicit user approval prevents unauthorized data injection.
- Exporters are isolated until approved.
- Trust boundaries are clearly defined.
- The model remains simple and aligned with LAN-only deployment.

### Negative

- The exporter does not verify the server identity.
- The system is not hardened for internet exposure.
- No mutual authentication is performed.
- Security relies on correct network configuration and user responsibility.
- If exposed publicly, the trust model would be insufficient.

## Alternatives considered

### Automatic trust based on network location

Rejected because being inside the LAN is not sufficient proof of legitimacy.

### Shared secret configured manually

Rejected due to poor usability and key management complexity.

### Full mutual TLS authentication

Rejected due to added complexity and misalignment with intended LAN-only scope.

### Token-based pre-shared registration

Rejected because explicit UI approval provides clearer user control.

## When to revisit

This decision should be revisited when one or more conditions are met:

- PlayAtlas is intended to be exposed to the public internet
- Remote access outside LAN becomes a supported scenario
- Stronger identity verification between server and exporter is required
- Mutual authentication or certificate pinning becomes necessary
- Multi-user environments introduce additional threat models