# Memento

**QR-triggered generative media application for digital reminiscence**

This project now contains three connected experiences that share one Express API and one SQL Server database:

1. **Expo / React Native mobile app** for grieving-family account owners.
2. **ReactJS website** with the same account, memorial-profile, tribute, QR, and subscription flows.
3. **Public QR memorial website** that opens without login after scanning a Legacy QR code.

## Main account flow

```text
Register / Login
      ↓
Memorial Profile Chooser
      ↓
Choose one deceased loved one
      ↓
That loved one's Dashboard
      ├─ Tributes
      ├─ Legacy QR Codes
      └─ Family Account/Profile
```

A newly registered user is **not forced to create a memorial immediately**. The user first sees the profile chooser and clicks **Add profile** when ready.

The first **3 deceased memorial profiles are free**. When a Standard account already has 3 profiles and the user clicks **Add profile**, Memento shows a profile-limit warning with a clickable **View Subscription** button. Monthly or Annual Memento Keepsake subscription records unlock additional memorial profiles.

---

## Project structure

```text
Memento---Mobile-with-api-fetch/
├─ App.js                         # Expo / React Native entry
├─ package.json
├─ assets/
├─ src/                           # React Native mobile source
├─ website/                       # NEW ReactJS/Vite browser application
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ .env.example
│  ├─ public/
│  │  └─ bow.png
│  └─ src/
│     ├─ App.jsx
│     ├─ MementoContext.jsx
│     ├─ api.js
│     ├─ main.jsx
│     └─ styles.css
├─ server/
│  ├─ index.js
│  ├─ db.js
│  ├─ routes/
│  ├─ services/
│  ├─ web/                        # public QR memorial React renderer
│  └─ uploads/videos/             # runtime only, not committed
└─ db/
   ├─ memento_database.sql        # ONLY current SQL source of truth
   └─ ERD.md
```

`db/schema.sql` and `db/seed.sql` are old files and are not used in this build.

---

## 1. Database

The current implementation uses **Microsoft SQL Server**.

Run only:

```text
db/memento_database.sql
```

The canonical model includes:

- `USERS`
- `DECEASED_PROFILES`
- `SUBSCRIPTIONS`
- `VIDEO_TRIBUTES`
- `SUPPLEMENTAL_IMAGES`
- `QR_MATRICES`

Core relationship:

```text
USERS
  1 ─────< DECEASED_PROFILES
  1 ─────< SUBSCRIPTIONS
  1 ─────< VIDEO_TRIBUTES

DECEASED_PROFILES
  1 ─────< VIDEO_TRIBUTES

VIDEO_TRIBUTES
  1 ─────< SUPPLEMENTAL_IMAGES
  1 ─────< QR_MATRICES
```

---

## 2. Configure and run the Express API

Open a terminal in VS Code:

```bash
cd server
npm install
```

Create `server/.env` from `.env.example` and use your real SQL Server credentials:

```env
DB_SERVER=51.79.166.239
DB_PORT=1433
DB_NAME=Memento
DB_USER=YOUR_SQL_USERNAME
DB_PASSWORD=YOUR_SQL_PASSWORD
DB_ENCRYPT=false
DB_TRUST_SERVER_CERT=true
PORT=3001
PUBLIC_SERVER_URL=http://51.79.166.239:3001
```

Then:

```bash
npm start
```

Health check:

```text
http://127.0.0.1:3001/health
```

`PUBLIC_SERVER_URL` must be reachable by the phone that scans a QR. For final deployment, use an HTTPS domain.

---

## 3. Run the mobile app

From the project root:

```bash
npm install
npx expo start -c
```

Optional root `.env`:

```env
EXPO_PUBLIC_API_BASE_URL=http://51.79.166.239:3001
EXPO_PUBLIC_WEB_PLAYER_URL=http://51.79.166.239:3001/memorial
```

If you use a physical phone with a locally running API, replace the server address with your PC's LAN IPv4 address.

---

## 4. Run the ReactJS website

The browser creator app is in `website/` and follows the same visual style and main workflow as the mobile app.

Start the API first, then open another terminal:

```bash
cd website
npm install
npm run dev
```

Open:

```text
http://localhost:5173/app/
```

Website features include:

- Register and login
- Recovery-request UI matching the mobile prototype
- Memorial profile chooser
- Add/edit/delete memorial profiles
- 3-free-profile limit and subscription warning
- Monthly / Annual subscription information
- Per-memorial dashboard
- Tribute upload / AI-oriented prototype flow
- Real Legacy QR generation
- QR-to-public-video website linking
- Account/profile editing
- Switch memorial profile
- Logout

### Hosted website build

Build it:

```bash
cd website
npm run build
```

Then restart the Express server:

```bash
cd ../server
npm start
```

When `website/dist/index.html` exists, Express serves the ReactJS application at:

```text
http://<server>:3001/app/
```

and the server root `/` redirects to `/app/`.

---

## 5. Website environment

`website/.env.example`:

```env
VITE_API_BASE_URL=
VITE_PUBLIC_SERVER_URL=http://127.0.0.1:3001
VITE_DEV_API_TARGET=http://127.0.0.1:3001
```

For production on the same Express host, `VITE_API_BASE_URL` can remain blank. The website will call `/users`, `/tributes`, `/qr`, and the other API routes on the same origin.

For a hosted QR flow, set `VITE_PUBLIC_SERVER_URL` to the same public Express origin used by `PUBLIC_SERVER_URL`.

---

## 6. Legacy QR → public website flow

```text
Creator selects memorial profile
      ↓
Uploads/saves a tribute video
      ↓
Tribute status becomes Ready
      ↓
Generate Legacy QR
      ↓
Link QR to that specific tribute
      ↓
QR contains:
https://your-domain/memorial/MEM-XXXXX
      ↓
Visitor scans using phone camera
      ↓
Browser opens public memorial
      ↓
Video + deceased name + years + story
```

A QR can only be linked when the tribute is `ready` and has a real `video_url`. The public memorial page requires no login and increments the QR `viewer_count`.

---

## 7. Subscription behavior

Standard account:

```text
Profile 1 = free
Profile 2 = free
Profile 3 = free
Profile 4+ = active subscription required
```

When the account is already at 3 profiles, **Add profile** first shows a warning. The user must deliberately click **View Subscription** to see Monthly and Annual options.

The backend also enforces the limit in `POST /deceased-profiles`, so the website/mobile UI cannot bypass the rule.

The current capstone build stores subscription activation directly in `SUBSCRIPTIONS`. A real payment gateway is not connected yet.

---

## 8. Important prototype limitations

- The manuscript currently says MySQL, while this source uses SQL Server. Update the manuscript if SQL Server is the final implementation.
- AI generation is still simulated; a live Veo/Gemini rendering pipeline is not connected.
- Forgot-password recovery is UI-only; a real OTP/reset-token backend is not yet implemented.
- Route-level JWT/session authorization is not yet implemented.
- Uploaded videos are stored under the Express server for the prototype. Production should use managed object/cloud storage.
- Subscription selection does not process real payment yet.

---

## 9. Quick commands

### API

```bash
cd server
npm install
npm start
```

### Mobile

```bash
npm install
npx expo start -c
```

### ReactJS website

```bash
cd website
npm install
npm run dev
```

### Build ReactJS website for Express hosting

```bash
cd website
npm run build
cd ../server
npm start
```

---

## 10. Account / credential reminder

The Memento app account (email/password used in Register/Login) is separate from the SQL Server login stored in `server/.env`.

Do not commit real database passwords, hosting credentials, or `.env` files to Git/Bitbucket.

## Uploaded video playback fix

Uploaded videos are now stored in the database using a server-relative `/uploads/videos/...` path. This prevents playback from breaking when you switch between localhost, a LAN IP, a public IP, or a future domain. The ReactJS website now renders an actual HTML5 video player after upload, and the React Native app opens the saved cloud video from the tribute detail screen.

If a video was uploaded using an older build and its saved URL points to an old/unreachable host, upload that video again once with this build so the new portable media path is stored.

### Mobile video player dependency
The mobile app now uses Expo Video for real in-app playback. After replacing/updating the project, run `npx expo install expo-video` once from the project root, then restart Expo with `npx expo start -c`.
