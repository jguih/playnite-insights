# Authentication

## Authelia

The simplest way to use [**Authelia**](https://www.authelia.com/) to protect your PlayAtlas server is putting it behind **caddy**. Here's an example Caddyfile configuration your can use:

```caddyfile
(secure) {
	forward_auth {args[0]} <authelia_address>:9091 {
		uri /api/authz/forward-auth
		copy_headers Remote-User Remote-Groups Remote-Email Remote-Name
	}
}

playatlas.mydomain.com {
  # Public endpoints used by PlayAtlas Exporter
  @extension path /api/extension /api/extension/*
  handle @extension {
    reverse_proxy <playatlas_address>:3000
  }
  handle {
    import secure *
    reverse_proxy <playatlas_address>:3000
  }
}
```

Endpoints matching `/api/extension` and `/api/extension/*` must remain publicly accessible, not protected by any custom auth solution like Authelia. These endpoints are used by PlayAtlas Exporter and are already secured using asymmetric key authentication.
