// Phase 5 — progressive avatar / batched unread / incremental mount
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colorFor } from '../../lib/avatar/colors';
import {
  AVATAR_LOAD_TIMEOUT_MS,
  AVATAR_MAX_FAILS,
  AVATAR_PLACEHOLDER_PULSE_MAX,
  AVATAR_PLACEHOLDER_PULSE_MIN,
  AVATAR_PLACEHOLDER_PULSE_MS,
  AVATAR_URL_TTL_MS
} from '../../lib/avatar/config';
import { toInitials } from '../../lib/avatar/initials';
import { prefetchOne } from '../../lib/avatar/prefetch';
import { resolveAvatarURL } from '../../lib/avatar/resolve';
import { useAvatarCache } from '../../store/avatarCacheStore';
import { useUiPerfStore } from '../../store/uiPerfStore';
import { toDataUri } from '../../utils/imagePlaceholder';

type Props = {
  id: string;                 // userId (or chatId future)
  size?: number;              // default 40
  name?: string;
  username?: string;
  imageURL?: string | null;
  email?: string | null;      // optional email for gravatar
  thumbBase64?: string;       // optional tiny base64 thumbnail
  // optional style overrides
  style?: any;
  textStyle?: any;
};

const AvatarBase: React.FC<Props> = ({ id, size = 40, name, username, imageURL, email, thumbBase64, style, textStyle }) => {
  const cached = useAvatarCache(s => s.get(id));
  const upsert = useAvatarCache(s => s.upsert);
  const retryToken = useAvatarCache(s => s.retryToken);
  const resetFails = useAvatarCache(s => s.resetFails);
  const markFail = useAvatarCache(s => s.markFail);
  const themeVersion = useUiPerfStore(s => s.themeVersion);
  const reducedMotion = useUiPerfStore(s => s.reducedMotion);
  const hasResolvedRef = useRef(false);
  const [timedOut, setTimedOut] = useState(false);
  const [pulse, setPulse] = useState(AVATAR_PLACEHOLDER_PULSE_MAX);
  const [isLoading, setIsLoading] = useState(false);

  const initials = cached?.initials ?? toInitials(name, username);
  const bg = cached?.color ?? colorFor(username || name || id);
  const failCount = cached?.failCount ?? 0;

  // TTL logic: use cached resolvedUrl if within TTL window
  const now = Date.now();
  const canUseCachedUrl = cached?.resolvedUrl && 
    cached.resolvedAt && 
    (now - cached.resolvedAt) < AVATAR_URL_TTL_MS;

  // Determine final URL to display
  let displayUrl: string | null = null;
  
  if (imageURL) {
    // Explicit URL provided - use immediately
    displayUrl = imageURL;
    if (!cached || cached.url !== imageURL) {
      upsert({ 
        uid: id, 
        url: imageURL, 
        resolvedUrl: imageURL, 
        source: 'explicit',
        initials, 
        color: bg, 
        updatedAt: now,
        resolvedAt: now 
      });
    }
  } else if (canUseCachedUrl && cached.resolvedUrl) {
    // Use cached resolved URL within TTL
    displayUrl = cached.resolvedUrl;
  } else if (!hasResolvedRef.current) {
    // Resolve URL once per component mount
    hasResolvedRef.current = true;
    
    useEffect(() => {
      let cancelled = false;
      
      (async () => {
        try {
          const { url, source } = await resolveAvatarURL({
            userId: id,
            avatarURL: imageURL ?? null,
            email: email ?? null,
          });
          
          if (cancelled) return;
          
          // Update cache with resolved URL
          upsert({
            uid: id,
            url: imageURL ?? null,
            resolvedUrl: url,
            source,
            initials,
            color: bg,
            updatedAt: now,
            resolvedAt: now,
          });
          
          // Prefetch if URL resolved
          if (url) {
            prefetchOne(url).catch(() => {});
          }
        } catch (error) {
          if (__DEV__) console.warn('Avatar URL resolve failed:', error);
        }
      })();
      
      return () => { cancelled = true; };
    }, [id, imageURL, email, initials, bg, now, upsert]);
  }

  // Reset timeout when retryToken changes or URL changes
  useEffect(() => {
    setTimedOut(false);
  }, [retryToken, displayUrl]);

  // Placeholder pulse effect (only while loading & not reducedMotion)
  useEffect(() => {
    if (!isLoading || reducedMotion) return;
    let mounted = true;
    const loop = () => {
      if (!mounted) return;
      setPulse(AVATAR_PLACEHOLDER_PULSE_MIN);
      setTimeout(() => mounted && setPulse(AVATAR_PLACEHOLDER_PULSE_MAX), AVATAR_PLACEHOLDER_PULSE_MS/2);
      setTimeout(() => mounted && loop(), AVATAR_PLACEHOLDER_PULSE_MS);
    };
    loop();
    return () => { mounted = false; };
  }, [isLoading, reducedMotion]);

  // Start timeout when showing image
  useEffect(() => {
    if (!displayUrl || failCount >= AVATAR_MAX_FAILS) return;
    
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setTimedOut(true);
      setIsLoading(false);
    }, AVATAR_LOAD_TIMEOUT_MS);
    
    return () => clearTimeout(timeout);
  }, [displayUrl, failCount]);

  // Update cache for initials/color if needed
  if (!cached || cached.initials !== initials || cached.color !== bg || cached.url !== (imageURL ?? null)) {
    upsert({ 
      uid: id, 
      url: imageURL ?? null, 
      initials, 
      color: bg, 
      updatedAt: now 
    });
  }

  const S = styles(size);
  const shouldShowImage = displayUrl && !timedOut && failCount < AVATAR_MAX_FAILS;
  const shouldShowPlaceholder = isLoading || (displayUrl && !shouldShowImage);
  const transitionDuration = reducedMotion ? 80 : 150;
  const tiny = toDataUri(thumbBase64);
  
  const content = (
    <>
      {/* Initials fallback (always mounted) */}
      <View style={[S.fallback, { backgroundColor: bg }]}>
        <Text style={[S.fallbackText, textStyle]} numberOfLines={1} allowFontScaling={false}>
          {initials}
        </Text>
      </View>
      
      {/* Gradient placeholder (visible when loading or failed, only if no thumbBase64) */}
      {shouldShowPlaceholder && !tiny && (
        <LinearGradient
          colors={[bg, `${bg}80`, bg]}
          style={[S.placeholder, { opacity: pulse }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      {/* Image (visible when loaded & no fail) */}
      {shouldShowImage && (
        <Image 
          source={{ uri: displayUrl! }} 
          placeholder={tiny}
          style={S.img} 
          cachePolicy="disk"
          contentFit="cover"
          transition={transitionDuration}
          recyclingKey={id}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => { 
            resetFails(id); 
            setTimedOut(false); 
            setIsLoading(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => { 
            markFail(id); 
            setTimedOut(true); 
            setIsLoading(false);
          }}
        />
      )}
    </>
  );

  return (
    <View 
      style={[S.root, style]} 
      key={`avatar-${id}-theme-${themeVersion}`}
    >
      {content}
    </View>
  );
};

export const Avatar = memo(AvatarBase);

const styles = (size: number) =>
  StyleSheet.create({
    root: { width: size, height: size, borderRadius: size / 2, overflow: 'hidden' },
    img: { width: size, height: size },
    fallback: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fallbackText: {
      fontWeight: '700',
      fontSize: Math.round(size * 0.42),
      color: 'white',
      includeFontPadding: false,
      textAlignVertical: 'center',
    },
    placeholder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: size / 2,
    },
  });
