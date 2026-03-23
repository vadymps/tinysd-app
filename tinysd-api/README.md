# TinySD API

Backend API for the TinySD application.

## Supported Providers

- `modelslab`
- `stability_ai`
- `google_gemini`
- `huggingface_inference`

## Setup

```bash
npm install
```

## Optional: Cloudinary Storage

By default, images are saved to the local `saved-images` folder. To store images
in Cloudinary instead, set these environment variables in `.env`:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_FOLDER` (optional)

## Development

```bash
# development
npm run start:dev

# production build
npm run build

# production run
npm run start:prod
```

## Tests

```bash
npm test
npm run test:e2e
npm run test:cov
```

## Lint

```bash
npm run lint
```
