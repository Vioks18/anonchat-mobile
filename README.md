# AnonChat Mobile

Анонимный чат-клиент для Android с поддержкой Email/Password аутентификации и уникальных @username.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd anonchat-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Download `google-services.json` to `android/app/`
   - Update `app/services/firebase.ts` with your config
   - Enable Email/Password authentication in Firebase Console

4. **Deploy Firestore Rules (Development)**
   ```bash
   firebase deploy --only firestore:rules --project your-project-id
   ```
   Or use the development rules: `firebase/rules_dev.firestore`

5. **Run the app**
   ```bash
   npx expo start
   ```

## 🔐 Authentication

### Email/Password + @username
- **Registration**: Email + Password + unique @username
- **Login**: Email + Password authentication
- **Password Reset**: Email-based password recovery
- **Anonymous Linking**: Link anonymous users to email accounts (preserves chat history)
- **Username System**: Unique, case-insensitive @usernames with atomic reservation

### Email Link (Passwordless)
- **Passwordless Sign-in**: Send magic link to email
- **App Links**: Automatic app opening via Firebase Hosting
- **Cross-device Support**: Complete sign-in on different devices
- **Secure**: Time-limited links with device verification

### Development Setup
1. Enable Email/Password and Email Link authentication in Firebase Console
2. Add authorized domain: `anonchat-axora.firebaseapp.com`
3. Deploy development Firestore rules (App Check disabled for Dev Client)
4. Test both authentication flows

### Security Notes
- **App Check is DISABLED** for Expo Dev Client compatibility
- Development rules allow public username availability checks
- Production deployment requires proper App Check configuration
- Email Link uses Firebase Hosting domain for App Links

## 🏗️ Architecture

### Tech Stack
- **React Native** + **Expo Dev Client**
- **TypeScript** for type safety
- **Firebase Auth** + **Firestore**
- **React Navigation** for routing
- **Zustand** for state management

### Data Model
- `users/{uid}` - User profiles with email, username, displayName
- `usernames/{handle}` - Username reservations (atomic)
- `chats/{chatId}` - Chat data and messages
- `userChats/{uid}/items/{chatId}` - User's chat list

## 📱 Features

### Chat System
- Real-time messaging
- Message reactions
- Message selection and deletion
- Chat history persistence
- Unread message counters

### User Management
- Unique @username system
- Display name customization
- User search by @username
- Anonymous user linking

### UI/UX
- Dark theme
- Responsive design
- Keyboard-aware inputs
- Loading states and error handling

## 🔧 Development

### Project Structure
```
app/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   └── ...
├── services/           # API and external services
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── navigation/         # Navigation configuration
```

### Key Files
- `app/services/authApi.ts` - Authentication API
- `app/hooks/useAuth.ts` - Authentication state management
- `app/utils/username.ts` - Username validation utilities
- `app/navigation/AuthNavigator.tsx` - Auth flow navigation
- `firebase/rules_dev.firestore` - Development Firestore rules

## 🧪 Testing

### Manual Testing Checklist
- [ ] Registration with email/password/username
- [ ] Login with correct/incorrect credentials
- [ ] Password reset email sending
- [ ] Anonymous user linking
- [ ] Username uniqueness validation
- [ ] Chat creation and messaging
- [ ] User search by @username

### Automated Testing
```bash
# Type checking
npx tsc --noEmit --skipLibCheck

# QA checks
npm run qa:strict
```

## 🚨 Troubleshooting

### Common Issues
1. **Firebase connection errors** - Check `google-services.json` and Firebase config
2. **Username already taken** - Username reservation is atomic, try a different one
3. **App Check errors** - App Check is disabled for development
4. **Navigation issues** - Ensure proper route configuration

### Development Notes
- App Check intentionally disabled for Expo Dev Client
- Development rules are permissive for testing
- Production deployment requires security hardening

## 📄 License

This project is for educational purposes. Use responsibly.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using React Native and Firebase**
