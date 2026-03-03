# Quick Start

Here's a quick way to install PlayAtlas so you can try it out as soon as possible.

## Requirements

- A dedicated **Linux** host that:

    * Can run **Podman** containers
    * Has a reverse-proxy to terminate TLS
    * Allows TCP connections on port 443 over LAN

- A personal **Windows** host with **Playnite** installed.
- A client device (mobile or desktop) with a modern browser (Firefox or Chromium-based).

!!! warning

    **PlayAtlas** is a distributed solution **requiring at least 3 distinct devices**. **Installing PlayAtlas directly on your Windows Playnite host is not supported nor recommended**. Other ways of installing PlayAtlas not mentioned in this documentation are not supported.

## Step 1: Start the Container

To deploy PlayAtlas using **Podman**, run:

```bash
podman run -d \
  --name playatlas \
  -v playatlas-data:/app/data \
  -e TZ=America/Sao_Paulo \
  -e PLAYATLAS_LOG_LEVEL=0 \
  docker.io/library/playatlas
```

PlayAtlas was designed to not be directly exposed, instead it should only be reachable through a reverse-proxy that can terminate a TLS connection, which is covered in the next step.

`Important: Explicit Interface Binding`

:   Do not expose PlayAtlas using `-p 3000:3000` without specifying an address.
    Doing so will bind the service to all network interfaces (`0.0.0.0` on IPv4 and `::` on IPv6), potentially exposing it beyond your intended trust boundary.

    **PlayAtlas is designed to operate within a controlled LAN environment** and may allow remote extension-triggered operations on your Playnite host. Binding explicitly ensures you maintain that boundary.

## Step 2: Configure HTTPS

When PlayAtlas is accessed from another device on your LAN, **HTTPS is required**.

Modern browsers restrict certain APIs (including Web Crypto APIs used by PlayAtlas) to secure contexts. Accessing the application via plain HTTP on a LAN IP (e.g., `http://192.168.x.x`) will cause runtime errors.

The recommended approach is to use a reverse proxy.

### Example: Caddy

Below is a minimal `Caddyfile` example, assuming Caddy is also running in a Podman container in the same network or pod as PlayAtlas:

```caddyfile
playatlas.local {
  reverse_proxy playatlas:3000
}
```
