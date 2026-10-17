# Build the Memento Android APK

The project is configured as an Expo / React Native Android application with package name:

`com.memento.app`

## Recommended: GitHub Actions

A workflow is included at:

`.github/workflows/build-apk.yml`

When this project is pushed to the `latest-mobile-version` branch, GitHub Actions will build the APK automatically. You can also start it manually from the repository's **Actions** tab by opening **Build Memento Android APK** and choosing **Run workflow**.

When the workflow finishes, open the workflow run and download the artifact named:

`Memento-Android-APK`

Inside it is:

`Memento.apk`

This APK is intended for direct testing/installing. Android may ask you to allow installation from the browser/file manager used to open it.

## Expo EAS alternative

An `eas.json` file is also included. On a computer with Node.js and internet access:

```bash
npm install
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

The `preview` profile is configured to generate an APK rather than an AAB.

## Local Android build alternative

If Android Studio / Android SDK is installed:

```bash
npm install
npx expo prebuild --platform android --clean
```

Because the current API uses plain HTTP (`http://51.79.166.239:3001`), ensure the generated `android/app/src/main/AndroidManifest.xml` application element permits cleartext traffic for this development endpoint. Then run:

### Windows

```powershell
cd android
.\gradlew.bat assembleRelease
```

### macOS / Linux

```bash
cd android
./gradlew assembleRelease
```

The generated APK will be at:

`android/app/build/outputs/apk/release/app-release.apk`

## Current API endpoint embedded by the app

The mobile source currently defaults to:

- API: `http://51.79.166.239:3001`
- Public memorial viewer: `http://51.79.166.239:3001/memorial`

For production, use an HTTPS API/domain and rebuild the app.
