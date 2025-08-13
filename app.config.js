module.exports = {
  expo: {
    name: "anonchat-mobile",
    slug: "anonchat-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true, // Включено для производительности
    ios: {
      supportsTablet: true
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
      intentFilters: [
        {
          action: "VIEW",
          category: ["BROWSABLE", "DEFAULT"],
          data: [
            {
              scheme: "https",
              host: "anonchat-axora.web.app",
              pathPrefix: "/auth/links"
            },
            {
              scheme: "https",
              host: "anonchat-axora.firebaseapp.com",
              pathPrefix: "/auth/links"
            }
          ]
        }
      ]
    },
    scheme: "anonchat",
    linking: {
      prefixes: ["anonchat://", "https://anonchat-axora.web.app", "https://anonchat-axora.firebaseapp.com"]
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
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
      typedRoutes: true
    },
    extra: {
      eas: {
        projectId: "57ef08f9-ca5c-4c83-a43f-0120a1dc474b"
      }
    },
                           owner: "rckxs"
  }
}; 