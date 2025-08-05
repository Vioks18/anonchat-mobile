import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, StatusBar, Text, TouchableOpacity, View } from 'react-native';

interface ImageViewerProps {
  visible: boolean;
  imageUri: string;
  images?: string[]; // Множественные изображения
  onClose: () => void;
  onDelete?: () => void;
  onAddReaction?: (reaction: string) => void;
  reactions?: string[];
}

const { width, height } = Dimensions.get('window');

const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  imageUri,
  images,
  onClose,
  onDelete,
  onAddReaction,
  reactions = [],
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Определяем массив изображений для отображения
  const imageArray = images || [imageUri];
  const currentImage = imageArray[currentImageIndex];

  const saveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Ошибка', 'Нужны разрешения для сохранения в галерею');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert('Успех', 'Фото сохранено в галерею');
      setShowMenu(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить фото');
    }
  };

  const shareImage = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri);
      } else {
        Alert.alert('Ошибка', 'Функция "Поделиться" недоступна');
      }
      setShowMenu(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось поделиться фото');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить фото',
      'Вы уверены, что хотите удалить это фото?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          }
        }
      ]
    );
    setShowMenu(false);
  };

  const handleLongPress = () => {
    setShowMenu(true);
  };

  const handleAddReaction = (reaction: string) => {
    onAddReaction?.(reaction);
    setShowReactions(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Кнопки управления */}
        <View style={{
          position: 'absolute',
          top: 50,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          zIndex: 10,
        }}>
          <TouchableOpacity
            onPress={onClose}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          {imageArray.length > 1 && (
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontFamily: 'Poppins-Regular',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 16,
            }}>
              {currentImageIndex + 1} / {imageArray.length}
            </Text>
          )}

          <TouchableOpacity
            onPress={() => setShowMenu(!showMenu)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Меню */}
        {showMenu && (
          <View style={{
            position: 'absolute',
            top: 110,
            right: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 12,
            padding: 8,
            zIndex: 20,
          }}>
            <TouchableOpacity
              onPress={saveToGallery}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Ionicons name="download-outline" size={20} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 12,
                fontSize: 16,
                fontFamily: 'Poppins-Regular',
              }}>
                Сохранить в галерею
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={shareImage}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
              }}
            >
              <Ionicons name="share-outline" size={20} color="white" />
              <Text style={{
                color: 'white',
                marginLeft: 12,
                fontSize: 16,
                fontFamily: 'Poppins-Regular',
              }}>
                Поделиться
              </Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#ff4444" />
                <Text style={{
                  color: '#ff4444',
                  marginLeft: 12,
                  fontSize: 16,
                  fontFamily: 'Poppins-Regular',
                }}>
                  Удалить
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Реакции */}
        {showReactions && (
          <View style={{
            position: 'absolute',
            bottom: 120,
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 12,
            padding: 8,
            zIndex: 20,
            flexDirection: 'row',
          }}>
            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
              <TouchableOpacity
                key={reaction}
                onPress={() => handleAddReaction(reaction)}
                style={{
                  padding: 8,
                  marginHorizontal: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 24 }}>{reaction}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Кнопки навигации для множественных изображений */}
        {imageArray.length > 1 && (
          <View style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            zIndex: 10,
          }}>
            <TouchableOpacity
              onPress={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
              disabled={currentImageIndex === 0}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: currentImageIndex === 0 ? 0.5 : 1,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowReactions(!showReactions)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="heart-outline" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCurrentImageIndex(Math.min(imageArray.length - 1, currentImageIndex + 1))}
              disabled={currentImageIndex === imageArray.length - 1}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: currentImageIndex === imageArray.length - 1 ? 0.5 : 1,
              }}
            >
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Кнопки действий для одного изображения */}
        {imageArray.length === 1 && (
          <View style={{
            position: 'absolute',
            bottom: 50,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            zIndex: 10,
          }}>
            <TouchableOpacity
              onPress={() => setShowReactions(!showReactions)}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 10,
              }}
            >
              <Ionicons name="heart-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Фото */}
        <TouchableOpacity
          onPress={() => {
            setShowMenu(false);
            setShowReactions(false);
          }}
          onLongPress={handleLongPress}
          style={{
            width: width,
            height: height,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            source={{ uri: currentImage }}
            style={{
              width: width,
              height: height * 0.8,
            }}
            contentFit="contain"
            priority="high"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageViewer;