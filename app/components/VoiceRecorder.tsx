import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VoiceRecorderProps {
  onSend: (audioUri: string, duration: number) => void;
  onClose?: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onClose }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    setDuration(0);
    // Имитация записи
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    
    setTimeout(() => {
      clearInterval(interval);
      setIsRecording(false);
      setHasRecording(true);
    }, 3000);
  };

  const sendRecording = () => {
    // Имитация отправки голосового сообщения
    const mockAudioUri = 'mock-audio-uri';
    onSend(mockAudioUri, duration);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!hasRecording ? (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingInfo}>
            <Ionicons name="radio-button-on" size={14} color="#ff4444" />
            <Text style={styles.timerText}>{formatTime(duration)}</Text>
            <View style={styles.waveContainer}>
              {[...Array(5)].map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.waveBar,
                    {
                      height: isRecording ? 8 + Math.random() * 12 : 4,
                    }
                  ]}
                />
              ))}
            </View>
          </View>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={startRecording}
            activeOpacity={0.8}
          >
            <Ionicons name="mic" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.playerContainer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {}}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={14} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.playerDuration}>
            {formatTime(duration)}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                setHasRecording(false);
                setDuration(0);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={16} color="#ff6b6b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={sendRecording}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#fff" />
              <Text style={styles.sendButtonText}>Отправить</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#23234d',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceMono-Regular',
    marginLeft: 6,
    marginRight: 12,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 2,
    backgroundColor: '#4ecdc4',
    borderRadius: 1,
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#23234d',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#444',
  },
  playButton: {
    backgroundColor: '#4ecdc4',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerDuration: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'SpaceMono-Regular',
    flex: 1,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default VoiceRecorder; 