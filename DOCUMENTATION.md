# Memento Implementation Notes

For setup and the complete current status, read `README.md` first.

## Source of truth

- Database: Microsoft SQL Server
- Canonical schema/upgrade file: `db/memento_database.sql`
- Old `schema.sql` / `seed.sql`: removed
- Mobile creator app: Expo + React Native
- Web creator app: ReactJS + Vite (`website/`)
- API: Express + `mssql`
- Public QR viewer: React-rendered zero-install memorial page from Express

## Multi-deceased family model

```text
Family account (USERS)
    ↓ one-to-many
Memorial profiles (DECEASED_PROFILES)
    ↓ one-to-many
Video tributes (VIDEO_TRIBUTES)
    ↓
Images + QR matrices
```

After login, the user always reaches the memorial profile chooser before the memorial dashboard. A new account with zero profiles stays on the chooser until the user clicks **Add profile**.

The first three memorial profiles are free. The fourth and later profiles require an active Monthly or Annual subscription record. The limit is enforced in both clients and in `POST /deceased-profiles`.

## ReactJS website

The `website/` folder mirrors the main creator workflow from the mobile app: account registration/login, memorial profile selection, dashboard, tribute creation/upload, QR management, subscription information, and account settings.

Development URL after `npm run dev`:

```text
http://localhost:5173/app/
```

Production build is served by Express at `/app/` after running `npm run build` inside `website/`.

## QR public-viewer flow

A Legacy QR is linked only to a tribute that is `ready` and has a public `video_url`. The QR encodes `/memorial/MEM-XXXXX`. Scanning opens the public memorial page with the linked video, deceased-person information, and story without requiring a Memento login.

## Current prototype limitations

- AI video generation is simulated until a real rendering provider is wired in.
- Forgot password remains UI-only; no OTP/reset-token backend yet.
- A real payment gateway is not connected; subscription selection activates the database record directly.
- JWT/session route authorization is not implemented yet.
- Prototype video storage is local to the Express server rather than managed object storage.
- The manuscript currently describes MySQL while the implementation uses Microsoft SQL Server.
