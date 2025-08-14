import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  expo: {
    name: "anonchat-mobile",
    slug: "anonchat-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true, // Включено для производительности
    jsEngine: "hermes",
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.axora.anonchat"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.axora.anonchat",
      googleServicesFile: "./google-services.json",
      softwareKeyboardLayoutMode: "resize",
      navigationBarColor: "#181825",
      statusBarColor: "#181825",
      // Настройки совместимости с Android 15
      allowBackup: true,
      enableProguardInReleaseBuilds: false,
      enableShrinkResourcesInReleaseBuilds: false,
      // Актуальные настройки для стабильности
      enableJetifier: true,
      useAndroidX: true,
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    },
    scheme: "anonchat",
    linking: {
      prefixes: ["anonchat://"]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 24,
            "targetSdkVersion": 35,
            "compileSdkVersion": 35,
            "kotlinVersion": "2.0.21"
          }
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Приложению требуется доступ к галерее для отправки фото.",
          cameraPermission: "Приложению требуется доступ к камере для съемки фото."
        }
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Приложению требуется доступ к галерее для сохранения фото.",
          savePhotosPermission: "Приложению требуется доступ к галерее для сохранения фото."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true
    },
    extra: {
      eas: {
        projectId: "57ef08f9-ca5c-4c83-a43f-0120a1dc474b"
      },
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
    },
    owner: "rckxs"
  }
}); 