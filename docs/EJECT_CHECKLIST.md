# EJECT CHECKLIST - Post-Prebuild Steps

## 📋 Native Steps Required After Prebuild

### 1. React Native Reanimated
**Status:** ✅ Already configured
- **Babel Plugin:** Already in babel.config.js
- **Post-prebuild:** No manual steps needed
- **Proguard Rules:** May need if using R8

### 2. React Native Gesture Handler
**Status:** ✅ Already configured
- **Import:** Already in app/index.tsx
- **Post-prebuild:** No manual steps needed

### 3. React Native Screens
**Status:** ✅ Expo managed
- **Post-prebuild:** No manual steps needed

### 4. React Native Safe Area Context
**Status:** ✅ Expo managed
- **Post-prebuild:** No manual steps needed

### 5. Expo Camera
**Status:** ✅ Expo managed
- **Permissions:** Already configured in app.config.js
- **Post-prebuild:** No manual steps needed

### 6. Expo Media Library
**Status:** ✅ Expo managed
- **Permissions:** Already configured in app.config.js
- **Post-prebuild:** No manual steps needed

---

## 🔧 Manual Gradle Tweaks (if needed)

### Proguard Rules for Reanimated
If using R8/Proguard, add to `android/app/proguard-rules.pro`:
```proguard
# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
```

### Google Services Plugin (fallback)
If Expo config plugin doesn't apply, add to `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

---

## 📁 File Placement

### google-services.json
**Current:** `./google-services.json` (root)
**After prebuild:** Copy to `android/app/google-services.json`
```bash
cp google-services.json android/app/
```

---

## ⚠️ Common Pitfalls

### Gradle Properties
- ✅ Keep one property per line
- ❌ Don't add `android.enableR8.fullMode=false` (deprecated)
- ✅ Use template from `docs/android-gradle.properties.template`

### Hermes
- ✅ Enabled by default
- ✅ No manual configuration needed

### R8/Proguard
- ✅ Keep `minifyEnabled` defaults
- ✅ Add Reanimated rules if using R8

---

## 🔐 SHA Fingerprints & App Check

### Development SHA
```bash
cd android
./gradlew signingReport
```
Look for "debug" variant SHA-1 and SHA-256.

### Firebase Console
1. Go to Project Settings → Your Apps → Android
2. Add SHA certificate fingerprints
3. Enable App Check when ready for production

---

## 🚀 Build Commands

### Dev Client
```bash
eas build -p android --profile dev-client
```

### Preview APK
```bash
eas build -p android --profile preview
```

### Production
```bash
eas build -p android --profile production
```
