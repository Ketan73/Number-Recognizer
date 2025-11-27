# Number Recognizer (React + Vite)

A lightweight Vite + React single-page app (SPA) for digit recognition.

This project lives in the `digit-recognizer/` subfolder of the repo.

## Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:5173.

Environment variables: if you use Firebase or other APIs, set them in a `.env` file (for local) and in Netlify (for deploy). Example `.env`:

```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
```

Vite exposes only variables prefixed with `VITE_` to the client.

## Build

```bash
npm run build
```

Outputs to `dist/`.

## Deploy (Netlify via GitHub)

Netlify will build and deploy automatically from your GitHub repo.

1. Push to GitHub from `digit-recognizer/`:

	```bash
	git init
	git add .
	git commit -m "Initial commit"
	git branch -M main
	git remote add origin <YOUR_GITHUB_REMOTE_URL>
	git push -u origin main
	```

2. In Netlify → New site from Git → select your repo.

3. Configure:
	- Build command: `npm run build`
	- Publish directory: `digit-recognizer/dist`
	- Environment variables: add your `VITE_*` keys under Site settings → Build & deploy → Environment

4. SPA routing: ensure `digit-recognizer/public/_redirects` contains:

	```
	/* /index.html 200
	```

Netlify will run the build on its servers; you don’t need to build locally for Git-based deploys.

## Tech Stack

- React 18
- Vite
- ESLint (configured)

## Project Structure

```
digit-recognizer/
  public/            # static assets and SPA redirects
  src/               # app source
	 components/
	 services/        # api clients (e.g., firebase)
  package.json
  vite.config.js
```

