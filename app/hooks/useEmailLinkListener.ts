import { useEffect } from "react";
import { Linking } from "react-native";
import { tryCompleteEmailLinkSignIn } from "../auth/emailLink";

export function useEmailLinkListener(onSignedIn?: () => void) {
  useEffect(() => {
    const sub = Linking.addEventListener("url", async ({ url }) => {
      const res = await tryCompleteEmailLinkSignIn(url);
      if (res.done && onSignedIn) onSignedIn();
    });
    
    // Also try once on mount (cold start)
    tryCompleteEmailLinkSignIn().then(res => { 
      if (res.done && onSignedIn) onSignedIn(); 
    });
    
    return () => sub.remove();
  }, [onSignedIn]);
}
