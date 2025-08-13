import Constants from "expo-constants";
import * as SecureStore from 'expo-secure-store';
import { getAuth, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from "firebase/auth";
import { Linking } from "react-native";

// Choose hosting domain (prefer web.app; fallback firebaseapp.com)
const HOSTING_DOMAIN = "anonchat-axora.web.app";
const FALLBACK_DOMAIN = "anonchat-axora.firebaseapp.com";

// Deep-link path we handle via intent-filter
const PATH_PREFIX = "/auth/links";

// Build the URL used by ActionCodeSettings (must be an authorized domain in Firebase Console)
const linkDomain = `https://${HOSTING_DOMAIN}${PATH_PREFIX}`;
const fallbackLinkDomain = `https://${FALLBACK_DOMAIN}${PATH_PREFIX}`;

const EMAIL_KEY = "PENDING_EMAIL_FOR_LINK_SIGNIN";

export const actionCodeSettings = {
  url: linkDomain,
  handleCodeInApp: true,
  // Firebase JS SDK expects nested android object for RN
  android: {
    // Read package from app config if available; Cursor will inject the packageName below
    packageName: Constants?.expoConfig?.android?.package ?? "com.axora.anonchat",
    installApp: true,
    minimumVersion: "12",
  },
  // dynamicLinkDomain is deprecated for new installs; do NOT set it
};

// Helper to send the link
export async function sendMagicLink(email: string) {
  const auth = getAuth();
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    await SecureStore.setItemAsync(EMAIL_KEY, email);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

// Legacy function for backward compatibility
export async function sendEmailLink(email: string) {
  const result = await sendMagicLink(email);
  if (!result.ok) {
    throw result.error;
  }
}

// Handle incoming links (call this once on app start)
export async function handleInitialEmailLink() {
  const auth = getAuth();
  // Check the app launch URL
  const initialUrl = await Linking.getInitialURL();
  const candidate = initialUrl ?? "";

  if (candidate && isSignInWithEmailLink(auth, candidate)) {
    // Retrieve the stored email or ask user to re-enter
    const email = await SecureStore.getItemAsync(EMAIL_KEY);
    if (!email) return { ok: false, reason: "missing_email" };

    try {
      const res = await signInWithEmailLink(auth, email, candidate);
      await SecureStore.deleteItemAsync(EMAIL_KEY);
      return { ok: true, user: res.user };
    } catch (e) {
      return { ok: false, error: e };
    }
  }

  // Also subscribe to future link events while app is running
  Linking.addEventListener("url", async ({ url }) => {
    if (url && isSignInWithEmailLink(auth, url)) {
      const email = await SecureStore.getItemAsync(EMAIL_KEY);
      if (!email) return;
      try {
        await signInWithEmailLink(auth, email, url);
        await SecureStore.deleteItemAsync(EMAIL_KEY);
      } catch {}
    }
  });

  return { ok: false, reason: "no_link" };
}

// Legacy function for backward compatibility
export async function tryCompleteEmailLinkSignIn(incomingUrl?: string) {
  const auth = getAuth();
  const url = incomingUrl ?? (await Linking.getInitialURL()) ?? "";
  if (!url) return { done: false };

  if (isSignInWithEmailLink(auth, url)) {
    let email = await SecureStore.getItemAsync(EMAIL_KEY);
    if (!email) {
      // Safety: if opened on another device, we must ask for email explicitly in UI.
      return { done: false, needsEmail: true, url };
    }
    const cred = await signInWithEmailLink(auth, email, url);
    await SecureStore.deleteItemAsync(EMAIL_KEY);
    return { done: true, user: cred.user };
  }
  return { done: false };
}
