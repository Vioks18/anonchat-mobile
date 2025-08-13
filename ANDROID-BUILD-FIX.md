# 🔧 Исправление проблем сборки Android

## Проблема
Ошибка при сборке Android с SDK 35:
```
ERROR: AAPT: error: resource style/Theme.EdgeToEdge (aka com.axora.anonchat:style/Theme.EdgeToEdge) not found.
```

## ✅ Исправления

### 1. Добавлена недостающая тема
В `android/app/src/main/res/values/styles.xml` добавлена тема `Theme.EdgeToEdge`:
```xml
<style name="Theme.EdgeToEdge" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    <item name="colorPrimary">@color/colorPrimary</item>
    <item name="android:statusBarColor">@android:color/transparent</item>
    <item name="android:navigationBarColor">@android:color/transparent</item>
    <item name="android:windowLightStatusBar">true</item>
    <item name="android:windowLightNavigationBar">true</item>
</style>
```

### 2. Создан файл themes.xml
Новый файл `android/app/src/main/res/values/themes.xml` с дополнительными темами для Android SDK 35.

### 3. Обновлены настройки Gradle
В `android/gradle.properties` добавлены настройки совместимости:
```properties
# Дополнительные настройки для Android SDK 35
android.enableR8.fullMode=false
android.enableDexingArtifactTransform.desugaring=false
android.enableResourceOptimizations=false
android.enableBuildCache=true
android.enableAapt2=true
android.enableD8.desugaring=true
android.enableD8.desugaring.artifacts=true
```

### 4. Добавлены явные зависимости
В `android/app/build.gradle` добавлены явные версии:
```gradle
implementation("androidx.appcompat:appcompat:1.6.1")
implementation("com.google.android.material:material:1.11.0")
implementation("androidx.core:core-ktx:1.12.0")
```

### 5. Обновлен app.config.js
Добавлены настройки для стабильности:
```javascript
enableJetifier: true,
useAndroidX: true,
enableAapt2: true,
enableD8: true,
enableR8: false
```

## 🚀 Команды для исправления

### Быстрое исправление:
```bash
npm run android:fix
```

### Полное исправление:
```bash
npm run fix:android
```

### Ручная очистка:
```bash
cd android
./gradlew clean
rm -rf app/build
./gradlew assembleDebug
```

## 📋 Проверка

После исправления проверьте:
1. ✅ Сборка проходит без ошибок
2. ✅ APK создается успешно
3. ✅ Приложение запускается на устройстве

## 🔍 Дополнительные решения

Если проблемы остаются:

1. **Очистка кэша Metro:**
   ```bash
   npx expo start --clear
   ```

2. **Переустановка зависимостей:**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Обновление Expo CLI:**
   ```bash
   npm install -g @expo/cli@latest
   ```

4. **Проверка версий:**
   ```bash
   npx expo doctor
   ```

## 📝 Примечания

- Проблема связана с обновлением Android SDK до версии 35
- Edge-to-edge режим стал стандартным в Android 15
- Некоторые библиотеки еще не обновились для поддержки новых тем
- Исправления обеспечивают обратную совместимость

---
**Дата исправления:** Январь 2025  
**Статус:** ✅ Исправлено
