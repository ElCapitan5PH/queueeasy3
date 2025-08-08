
# QueueEasy — Frontend MVP (React + Vite + Tailwind)

## Local Dev
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Vercel (Git Import)
1. Push this folder to a GitHub repo.
2. Go to https://vercel.com/new and import the repo.
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy. Your app will be available at a vercel.app URL.

## Vercel CLI (no Git)
```bash
npm i -g vercel
vercel       # first deploy (staging)
vercel --prod
```

## Notes
- This is a frontend-only MVP; data is stored in `localStorage`.
- Manifest + simple service worker included so you can install it on mobile.
