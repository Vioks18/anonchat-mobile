import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import ImageViewer from "./ImageViewer";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions: string[];
  replyTo?: Message;
  image?: string;
  images?: string[]; // Множественные изображения
  audio?: string;
  duration?: number;
}

interface MessageItemProps {
  item: Message;
  onPress: (id: string) => void;
  onLongPress: (id: string) => void;
  onRemoveReaction: (id: string) => void;
  onAddReaction: (id: string, reaction: string) => void;
  onDeleteMessage?: (id: string) => void;
  showReactions: string | null;
  isSelected?: boolean;
  styles: any;
  currentlyPlayingAudio?: string | null;
  onAudioPlay?: (audioId: string) => void;
  onAudioStop?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({
  item,
  onPress,
  onLongPress,
  onRemoveReaction,
  onAddReaction,
  onDeleteMessage,
  showReactions,
  isSelected = false,
  styles,
  currentlyPlayingAudio,
  onAudioPlay,
  onAudioStop,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const playAudio = async () => {
    try {
      console.log('Попытка воспроизвести аудио:', item.audio);
      
      if (!item.audio) {
        console.log('Аудио URI отсутствует');
        return;
      }
      
      // Имитация воспроизведения
      if (isPlaying) {
        setIsPlaying(false);
        onAudioStop?.();
      } else {
        setIsPlaying(true);
        onAudioPlay?.(item.id);
        
        // Имитация длительности аудио
        if (item.duration) {
          setDuration(item.duration);
        } else {
          setDuration(30); // Дефолтная длительность 30 секунд
        }
        
        // Имитация прогресса воспроизведения
        const progressInterval = setInterval(() => {
          setPosition(prev => {
            if (prev >= duration) {
              clearInterval(progressInterval);
              setIsPlaying(false);
              onAudioStop?.();
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.log('Ошибка при воспроизведении аудио:', error);
    }
  };

  useEffect(() => {
    if (isSelected) {
      try {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(opacityAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    } else {
      try {
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(opacityAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    }
  }, [isSelected, scaleAnim, opacityAnim]);

  useEffect(() => {
    if (showReactions === item.id) {
      try {
        Animated.spring(reactionAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    } else {
      try {
        Animated.spring(reactionAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      } catch (error) {
        // Игнорируем ошибки анимации
      }
    }
  }, [showReactions, item.id, reactionAnim]);

  // Синхронизация состояния воспроизведения
  useEffect(() => {
    if (currentlyPlayingAudio !== item.id && isPlaying) {
      setIsPlaying(false);
      setPosition(0);
    }
  }, [currentlyPlayingAudio, item.id, isPlaying]);

  return (
    <Animated.View 
      style={[
        item.image ? styles.messageContainerWithImage : styles.messageContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: item.sender === "me" ? "flex-end" : "flex-start",
        }
      ]}
    >
      {/* Затемнение под выделенным сообщением */}
      {isSelected && (
        <Animated.View 
          style={[
            styles.messageOverlay,
            {
              opacity: opacityAnim.interpolate({
                inputRange: [0.95, 1],
                outputRange: [0.3, 0],
              })
            }
          ]}
        />
      )}
      
      <TouchableOpacity
        style={styles.messageTouchable}
        onPress={() => onPress(item.id)}
        onLongPress={() => onLongPress(item.id)}
        activeOpacity={0.8}
      >
        <View style={[
           item.image ? styles.bubbleContainerWithImage : styles.bubbleContainer,
          item.sender === "other" && styles.bubbleContainerOther
        ]}>
          {item.sender === "me" && item.reactions.length > 0 && (
            <TouchableOpacity
              style={styles.reaction}
              onPress={() => onRemoveReaction(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionText}>
                {item.reactions[0]}
              </Text>
            </TouchableOpacity>
          )}
                     <Animated.View style={[
            item.image ? styles.bubbleWithImage : styles.bubble,
            !item.image && (item.sender === "me" ? styles.bubbleMe : styles.bubbleOther),
            !item.image && isSelected && (item.sender === "me" ? styles.bubbleSelected : styles.bubbleSelectedOther),
           ]}>
             {item.replyTo && (
              <View style={styles.replyPreview}>
                <Text style={styles.replyPreviewText} numberOfLines={1}>
                  {item.replyTo.text}
                </Text>
              </View>
            )}
                         <View style={[
                           styles.messageContent,
                           item.image && styles.messageContentWithImage
                         ]}>
               {(item.image || item.images) && (
                 <View style={styles.imagesContainer}>
                   {(item.images ? item.images.slice(0, 2) : [item.image]).map((imageUri, index) => (
                     <TouchableOpacity
                       key={index}
                       onPress={() => setShowImageViewer(true)}
                       activeOpacity={0.9}
                       style={styles.imageWrapper}
                     >
                       <Image 
                         source={{ uri: imageUri }}
                         style={[
                           styles.messageImage,
                           item.images && item.images.length > 1 && {
                             width: 120,
                             height: 120,
                           }
                         ]}
                         contentFit="cover"
                       />
                       {item.images && item.images.length > 2 && index === 1 && (
                         <View style={styles.imagesOverlay}>
                           <Text style={styles.imagesCount}>+{item.images.length - 2}</Text>
                         </View>
                       )}
                     </TouchableOpacity>
                   ))}
                 </View>
               )}
               {(item.image || item.images) && item.text && (
                 <View style={styles.imageTextContainer}>
                   <Text style={styles.bubbleTextWithImage}>{item.text}</Text>
                   <Text style={styles.timestampWithImage}>
                     {new Date(item.timestamp).toLocaleTimeString('ru-RU', { 
                       hour: '2-digit', 
                       minute: '2-digit' 
                     })}
                   </Text>
                 </View>
               )}
               {!item.image && item.text && (
              <Text style={styles.bubbleText}>{item.text}</Text>
               )}
               {!item.image && !item.audio && (
              <Text style={styles.timestamp}>
                {new Date(item.timestamp).toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
               )}
               {item.audio && (
                 <View style={styles.audioContent}>
                   <TouchableOpacity
                     style={styles.audioButton}
                     onPress={playAudio}
                     activeOpacity={0.7}
                   >
                     <Ionicons 
                       name={isPlaying ? "pause" : "play"} 
                       size={20} 
                       color="#fff" 
                     />
                   </TouchableOpacity>
                   <View style={styles.audioInfo}>
                     <Text style={styles.audioText}>Голосовое сообщение</Text>
                     <Text style={styles.audioDuration}>
                       {item.duration ? 
                         `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` :
                         `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
                       }
                     </Text>
                   </View>
                   {isPlaying && (
                     <View style={styles.audioProgressContainer}>
                       <View style={styles.audioProgressBar}>
                         <View 
                           style={[
                             styles.audioProgressFill, 
                             { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
                           ]} 
                         />
                       </View>
                     </View>
                   )}
                 </View>
               )}
            </View>
          </Animated.View>
          
          {item.sender === "me" && (
            <Ionicons 
              name={
                item.status === "sending" ? "time-outline" :
                item.status === "sent" ? "checkmark-outline" :
                item.status === "delivered" ? "checkmark-outline" :
                "checkmark-done-outline"
              }
              size={12}
              style={[
                styles.statusIcon,
                item.status === "sending" && styles.statusSending,
                item.status === "sent" && styles.statusSent,
                item.status === "delivered" && styles.statusDelivered,
                item.status === "read" && styles.statusRead,
              ]}
            />
          )}
          {item.sender === "other" && item.reactions.length > 0 && (
            <TouchableOpacity
              style={styles.reaction}
              onPress={() => onRemoveReaction(item.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.reactionText}>
                {item.reactions[0]}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
      

      
      {showReactions === item.id && (
        <Animated.View 
          style={[
            styles.reactionsPopup, 
            styles.reactionsPopupRight,
            {
              transform: [{
                scale: reactionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }],
              opacity: reactionAnim
            }
          ]}
        >
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => onAddReaction(item.id, "👍")}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionButtonText}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => onAddReaction(item.id, "❤️")}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionButtonText}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => onAddReaction(item.id, "😂")}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionButtonText}>😂</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => onAddReaction(item.id, "😮")}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionButtonText}>😮</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => onAddReaction(item.id, "😢")}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionButtonText}>😢</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => onAddReaction(item.id, "😡")}
            activeOpacity={0.7}
          >
            <Text style={styles.reactionButtonText}>😡</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
       
       {/* ImageViewer для просмотра фото */}
       <ImageViewer
         visible={showImageViewer}
         imageUri={item.image || ''}
         images={item.images}
         onClose={() => setShowImageViewer(false)}
         onDelete={() => {
           if (onDeleteMessage) {
             onDeleteMessage(item.id);
           }
           setShowImageViewer(false);
         }}
         onAddReaction={(reaction: string) => {
           onAddReaction(item.id, reaction);
           setShowImageViewer(false);
         }}
         reactions={item.reactions}
       />
    </Animated.View>
  );
};

export default MessageItem; 