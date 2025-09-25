# Recipe Generator (Hackday)
Enter available ingredients, pick a persona style, get a structured, fun recipe.
## Features
- Persona styles
- Mock mode if no OpenAI key
- Caching + simple rate limiting
- Minimal React UI
## Setup
1. Clone: git clone <repo-url> && cd project
2. Server:
   cd server
   cp .env.example .env
   (optional) add OPENAI_API_KEY
   npm install
3. Client:
   cd client
   npm install
4. Run (two terminals):
   Terminal 1: cd server && npm run dev
   Terminal 2: cd client && npm run dev
5. Open http://localhost:5173
## Extend Styles
1. Add style in server/src/styles.js
2. Add option in client/src/App.jsx STYLES array.
## Deploy (simple)
- Server: render/vercel/railway (set OPENAI_API_KEY)
- Client: static host (Netlify/Vercel) with /api proxy or full-stack deploy.
