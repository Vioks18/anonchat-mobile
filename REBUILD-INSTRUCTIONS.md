# Dev Client Rebuild Instructions

## 🚀 Quick Start

### 1. Build and Install
```bash
# Standard build
expo run:android

# With specific device
expo run:android --device

# Clean build (if needed)
expo run:android --clear
```

### 2. Test Checklist
- [ ] **Sign Up:** Email/password registration
- [ ] **Sign In:** Email/password authentication  
- [ ] **Chat List:** Load conversations
- [ ] **Send Message:** Text input and sending
- [ ] **Delete Message:** Swipe to delete
- [ ] **Reactions:** Emoji reactions
- [ ] **Profile:** Edit display name and avatar
- [ ] **Navigation:** Back button and gestures

### 3. Firebase Setup (Later)
1. Get SHA-256 fingerprints from Android Studio
2. Add to Firebase Console → Project Settings → Android
3. Enable App Check when ready for production

## ✅ Status: READY FOR REBUILD
- All dependencies updated
- Configuration optimized
- Prebuild successful
- No blocking issues
