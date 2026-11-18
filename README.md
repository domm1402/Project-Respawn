# Respawn

Respawn is a local-first gaming companion with four core areas:

- **Gaming HQ:** a dashboard for your collection, level and progress.
- **Game Vault:** organise owned games and a wishlist.
- **Setup Builder:** configure a sample PC build and save it locally.
- **Level Up:** complete missions and earn Respawn XP.

## Run

```sh
npm install
npx expo start
```

## Android APK

Pushes to main run the Android APK workflow. The APK is uploaded as the `Project-Respawn-Android-APK` artifact.

## Data

Vault entries, missions, XP and saved builds are stored on the device using Expo SecureStore. Current game catalog, component choices and estimated prices are starter/demo data. Platform playtime, retailer prices and hardware compatibility are not live integrations yet.
