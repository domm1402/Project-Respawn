# Respawn

Respawn is a local-first gaming companion with four core areas:

- **Gaming HQ:** a dashboard for your collection, level and progress.
- **Game Vault:** organise owned games and a wishlist.
- **Setup Builder:** configure a sample PC build and save it locally.
- **Level Up:** complete missions and earn Respawn XP.
- **Community:** public game channels backed by the Respawn Cloudflare Worker and D1 database.

## Run

```sh
npm install
npx expo start
```

## Android APK

Pushes to main run the Android APK workflow. The APK is uploaded as the `Project-Respawn-Android-APK` artifact.

Set the GitHub Actions repository variable `EXPO_PUBLIC_API_URL` to the deployed Worker URL to enable shared Community chat in the APK.

## Data

Vault entries, missions, XP and saved builds are stored on the device using Expo SecureStore. Current game catalog, component choices and estimated prices are starter/demo data. Platform playtime, retailer prices and hardware compatibility are not live integrations yet.
