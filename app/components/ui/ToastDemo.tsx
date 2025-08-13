import React, { useState } from "react";
import { View, Button } from "react-native";
import CustomAlert from "./CustomAlert";
import { toast } from "./Toast";

export default function ToastDemo() {
  const [alert, setAlert] = useState({ visible: false, message: "" });

  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 12, padding: 24 }}>
      <Button title="Показать успех (toast)" onPress={() => {
        toast.show({ type: "success", title: "Готово", message: "Email-link отправлен!" });
      }} />
      <Button title="Показать ошибку (alert)" onPress={() => setAlert({ visible: true, message: "Что-то пошло не так" })} />
      <CustomAlert
        visible={alert.visible}
        type="error"
        title="Ошибка"
        message={alert.message}
        onConfirm={() => setAlert({ visible: false, message: "" })}
      />
    </View>
  );
}
