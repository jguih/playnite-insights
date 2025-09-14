# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## ShareX

```
{
  "Version": "18.0.1",
  "Name": "PlayAtlas",
  "DestinationType": "ImageUploader",
  "RequestMethod": "POST",
  "RequestURL": "https://example.domain.com/api/assets/upload/screenshot",
  "Body": "MultipartFormData",
  "FileFormName": "file",
  "URL": "https://example.domain.com/api/assets/image/screenshot/{json:files.[0]}"
}
```

## PlayAtlas Exporter HttpServer Setup

1. Reserve the port the HttpServer will listen on:

```ps
netsh http add urlacl url=http://+:3001/ user=YOUR_USER
```

2. Allow traffic for that port by creating a firewall rule, follow `https://support.microsoft.com/en-us/windows/risks-of-allowing-apps-through-windows-firewall-654559af-3f54-3dcf-349f-71ccd90bcc5c`.
