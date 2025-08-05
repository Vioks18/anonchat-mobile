import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface MultiImageModalProps {
  visible: boolean;
  images: string[];
  onClose: () => void;
  onSend: (images: string[], text: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const imageSize = (screenWidth - 60) / 3; // 3 колонки с отступами

const MultiImageModal: React.FC<MultiImageModalProps> = ({
  visible,
  images,
  onClose,
  onSend,
}) => {
  const [text, setText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>(images);

  const handleSend = () => {
    if (selectedImages.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы одно фото');
      return;
    }
    onSend(selectedImages, text.trim());
    setText('');
    setSelectedImages(images);
  };

  const toggleImageSelection = (imageUri: string) => {
    if (selectedImages.includes(imageUri)) {
      setSelectedImages(prev => prev.filter(uri => uri !== imageUri));
    } else {
      setSelectedImages(prev => [...prev, imageUri]);
    }
  };

  const selectAll = () => {
    setSelectedImages(images);
  };

  const deselectAll = () => {
    setSelectedImages([]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Выбрано фото ({selectedImages.length}/{images.length})
          </Text>
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={selectAll} style={styles.actionButton}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Выбрать все</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deselectAll} style={styles.actionButton}>
            <Ionicons name="close-circle" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Снять выбор</Text>
          </TouchableOpacity>
        </View>

        {/* Images Grid */}
        <ScrollView style={styles.imagesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.imagesGrid}>
            {images.map((imageUri, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.imageContainer,
                  selectedImages.includes(imageUri) && styles.imageSelected
                ]}
                onPress={() => toggleImageSelection(imageUri)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  contentFit="cover"
                />
                {selectedImages.includes(imageUri) && (
                  <View style={styles.selectionOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Text Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Добавить подпись к фото..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <Text style={styles.characterCount}>
            {text.length}/500
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4ecdc4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  imagesContainer: {
    flex: 1,
    padding: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: imageSize,
    height: imageSize,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageSelected: {
    borderWidth: 3,
    borderColor: '#4ecdc4',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  inputContainer: {
    padding: 16,
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  textInput: {
    backgroundColor: '#23234d',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#444',
  },
  characterCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'SpaceMono-Regular',
  },
});

export default MultiImageModal;