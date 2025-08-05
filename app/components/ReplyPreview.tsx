import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions: string[];
  replyTo?: Message;
}

interface ReplyPreviewProps {
  replyTo: Message;
  onClose: () => void;
  styles: any;
}

const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  replyTo,
  onClose,
  styles,
}) => {
  return (
    <View style={styles.replyContainer}>
      <View style={styles.replyContent}>
        <Text style={styles.replyLabel}>Ответ на:</Text>
        <Text style={styles.replyText} numberOfLines={1}>
          {replyTo.text}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.replyClose}
        onPress={onClose}
      >
        <Text style={styles.replyCloseText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReplyPreview; 