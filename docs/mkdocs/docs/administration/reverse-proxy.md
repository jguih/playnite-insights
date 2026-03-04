# Reverse Proxy

## Caddy

```caddyfile
playatlas.mydomain.com {
  reverse_proxy <playatlas_address>:3000
}
```
