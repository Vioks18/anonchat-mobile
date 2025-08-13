# UI Components - Custom Notifications

## Обзор

Система кастомных уведомлений заменяет нативные `Alert.alert()` на красивые, анимированные компоненты с темной темой.

## Компоненты

### 1. CustomAlert

Модальное окно с двумя кнопками для подтверждения/отмены действий.

**Расположение**: `app/components/ui/CustomAlert.tsx`

**Типы**: `success`, `error`, `info`, `warning`

**Использование**:
```tsx
import CustomAlert from '@/app/components/ui/CustomAlert';

const [alert, setAlert] = useState({ visible: false, message: '' });

<CustomAlert
  visible={alert.visible}
  type="error"
  title="Ошибка"
  message={alert.message}
  onConfirm={() => setAlert({ visible: false, message: '' })}
/>
```

### 2. Toast

Глобальная система тостов для быстрых уведомлений.

**Расположение**: `app/components/ui/Toast.tsx`

**Singleton API**: `toast.show({...})`

**Использование**:
```tsx
import { toast } from '@/app/components/ui/Toast';

// Успех
toast.show({
  type: 'success',
  title: 'Успех',
  message: 'Операция выполнена успешно!',
});

// Ошибка
toast.show({
  type: 'error',
  message: 'Что-то пошло не так',
});
```

## Интеграция

### ToastProvider

Корень приложения обернут в `ToastProvider` в `app/index.tsx`:

```tsx
import { ToastProvider } from '@/app/components/ui/Toast';

export default function HomePage() {
  return (
    <ToastProvider>
      <RootNavigator />
    </ToastProvider>
  );
}
```

### Замена Alert.alert

**До**:
```tsx
Alert.alert('Ошибка', 'Что-то пошло не так');
```

**После**:
```tsx
// Для ошибок
setErrorAlert({ visible: true, message: 'Что-то пошло не так' });

// Для успеха
toast.show({
  type: 'success',
  title: 'Успех',
  message: 'Операция выполнена!',
});
```

## Обновленные экраны

### ✅ AuthEmailLinkScreen
- Заменены все `Alert.alert()` на `toast.show()` и `CustomAlert`
- Успешные операции → toast
- Ошибки → CustomAlert

### ✅ RegisterScreen  
- Заменены все `Alert.alert()` на `toast.show()` и `CustomAlert`
- Успешная регистрация/привязка → toast
- Ошибки валидации → CustomAlert

### 🔄 Остальные экраны
- LoginScreen
- ForgotPasswordScreen
- ChatListScreen
- UsernameScreen
- ChatInput

## Стили

### Темная тема
- Фон: `#111215`
- Границы: `rgba(255,255,255,0.06)`
- Текст: `#E5E7EB`, `#AEB2BA`

### Цвета типов
- **Success**: `#22C55E` ✅
- **Error**: `#EF4444` ⛔️
- **Info**: `#3B82F6` ℹ️
- **Warning**: `#F59E0B` ⚠️

### Анимации
- **CustomAlert**: fade + scale с spring
- **Toast**: fade + slide с easing

## Критерии готовности

✅ **ToastProvider** обертывает корень приложения  
✅ **CustomAlert** работает с кнопками Ок/Отмена  
✅ **Toast** отображается поверх всех экранов  
✅ **Alert.alert()** заменен в AuthEmailLinkScreen и RegisterScreen  
✅ **Темная тема** с аккуратными анимациями  
✅ **Expo-friendly** - без нативных зависимостей  

## Демо

Создан демо-компонент `app/components/ui/ToastDemo.tsx` для тестирования:

```tsx
import ToastDemo from '@/app/components/ui/ToastDemo';
```

## Следующие шаги

1. Заменить `Alert.alert()` в остальных экранах
2. Добавить поддержку iOS (если потребуется)
3. Настроить автоматическое скрытие для определенных типов ошибок
