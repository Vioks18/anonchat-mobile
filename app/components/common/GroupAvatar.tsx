import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useUiPerfStore } from '../../store/uiPerfStore';
import { Avatar } from './Avatar';

type Member = { 
  uid: string; 
  avatarURL?: string | null; 
  email?: string | null; 
  title?: string 
};

type GroupAvatarProps = {
  members: Member[]; // use first 2–3
  size?: number;     // default 40
  borderWidth?: number; // hairline separators between circles
};

const GroupAvatarBase: React.FC<GroupAvatarProps> = ({ 
  members, 
  size = 40, 
  borderWidth = 1 
}) => {
  const themeVersion = useUiPerfStore(s => s.themeVersion);
  const validMembers = members.slice(0, 3).filter(m => m.uid);
  
  if (validMembers.length === 0) {
    return <Avatar id="empty-group" size={size} />;
  }
  
  if (validMembers.length === 1) {
    const member = validMembers[0];
    return (
      <Avatar 
        id={member.uid}
        size={size}
        name={member.title}
        imageURL={member.avatarURL}
        email={member.email}
      />
    );
  }
  
  const S = styles(size, borderWidth);
  
  if (validMembers.length === 2) {
    // Two overlapping circles (left/right overlap ~30%)
    const overlap = size * 0.3;
    const subSize = size * 0.8;
    
    return (
      <View 
        style={S.container}
        key={`group-avatar-2-${validMembers[0].uid}-${validMembers[1].uid}-theme-${themeVersion}`}
      >
        <View style={[S.member2, { left: overlap, width: subSize, height: subSize }]}>
          <Avatar 
            id={validMembers[1].uid}
            size={subSize}
            name={validMembers[1].title}
            imageURL={validMembers[1].avatarURL}
            email={validMembers[1].email}
          />
        </View>
        <View style={[S.member1, { width: subSize, height: subSize }]}>
          <Avatar 
            id={validMembers[0].uid}
            size={subSize}
            name={validMembers[0].title}
            imageURL={validMembers[0].avatarURL}
            email={validMembers[0].email}
          />
        </View>
      </View>
    );
  }
  
  // Three members: triangle layout (top single small, bottom two small)
  const subSize = size * 0.6;
  const topOffset = size * 0.1;
  const bottomOffset = size * 0.4;
  const sideOffset = size * 0.2;
  
  return (
    <View 
      style={S.container}
      key={`group-avatar-3-${validMembers[0].uid}-${validMembers[1].uid}-${validMembers[2].uid}-theme-${themeVersion}`}
    >
      {/* Top member */}
      <View style={[S.memberTop, { 
        top: topOffset, 
        left: (size - subSize) / 2,
        width: subSize, 
        height: subSize 
      }]}>
        <Avatar 
          id={validMembers[0].uid}
          size={subSize}
          name={validMembers[0].title}
          imageURL={validMembers[0].avatarURL}
          email={validMembers[0].email}
        />
      </View>
      
      {/* Bottom left member */}
      <View style={[S.memberBottomLeft, { 
        top: bottomOffset, 
        left: sideOffset,
        width: subSize, 
        height: subSize 
      }]}>
        <Avatar 
          id={validMembers[1].uid}
          size={subSize}
          name={validMembers[1].title}
          imageURL={validMembers[1].avatarURL}
          email={validMembers[1].email}
        />
      </View>
      
      {/* Bottom right member */}
      <View style={[S.memberBottomRight, { 
        top: bottomOffset, 
        left: size - sideOffset - subSize,
        width: subSize, 
        height: subSize 
      }]}>
        <Avatar 
          id={validMembers[2].uid}
          size={subSize}
          name={validMembers[2].title}
          imageURL={validMembers[2].avatarURL}
          email={validMembers[2].email}
        />
      </View>
    </View>
  );
};

export const GroupAvatar = memo(GroupAvatarBase);

const styles = (size: number, borderWidth: number) =>
  StyleSheet.create({
    container: {
      width: size,
      height: size,
      position: 'relative',
    },
    member1: {
      position: 'absolute',
      zIndex: 2,
      borderRadius: size / 2,
      borderWidth: borderWidth,
      borderColor: '#1a1a2e',
    },
    member2: {
      position: 'absolute',
      zIndex: 1,
      borderRadius: size / 2,
      borderWidth: borderWidth,
      borderColor: '#1a1a2e',
    },
    memberTop: {
      position: 'absolute',
      zIndex: 3,
      borderRadius: size / 2,
      borderWidth: borderWidth,
      borderColor: '#1a1a2e',
    },
    memberBottomLeft: {
      position: 'absolute',
      zIndex: 1,
      borderRadius: size / 2,
      borderWidth: borderWidth,
      borderColor: '#1a1a2e',
    },
    memberBottomRight: {
      position: 'absolute',
      zIndex: 2,
      borderRadius: size / 2,
      borderWidth: borderWidth,
      borderColor: '#1a1a2e',
    },
  });
