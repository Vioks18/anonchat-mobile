const fs = require('fs');
const path = require('path');

class ComponentGenerator {
  constructor() {
    this.templates = {
      component: this.getComponentTemplate(),
      hook: this.getHookTemplate(),
      provider: this.getProviderTemplate(),
      screen: this.getScreenTemplate()
    };
  }

  // Шаблон компонента
  getComponentTemplate() {
    return `import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

interface {{COMPONENT_NAME}}Props {
  // Добавьте пропсы здесь
}

export const {{COMPONENT_NAME}}: React.FC<{{COMPONENT_NAME}}Props> = React.memo(({
  // Добавьте пропсы здесь
}) => {
  // Обработчики событий
  const handlePress = useCallback(() => {
    try {
      // Логика обработки
    } catch (error) {
      console.error('{{COMPONENT_NAME}}: Ошибка обработки', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Содержимое компонента */}
    </View>
  );
});

{{COMPONENT_NAME}}.displayName = '{{COMPONENT_NAME}}';

const styles = StyleSheet.create({
  container: {
    // Стили компонента
  },
});
`;
  }

  // Шаблон хука
  getHookTemplate() {
    return `import { useCallback, useEffect, useState } from 'react';

interface {{HOOK_NAME}}Return {
  // Добавьте возвращаемые значения
}

export const use{{HOOK_NAME}} = (): {{HOOK_NAME}}Return => {
  const [state, setState] = useState();

  // Безопасная установка состояния
  const safeSetState = useCallback((updater: any) => {
    try {
      setState(updater);
    } catch (error) {
      console.error('use{{HOOK_NAME}}: Ошибка установки состояния', error);
    }
  }, []);

  // Эффекты
  useEffect(() => {
    try {
      // Логика эффекта
    } catch (error) {
      console.error('use{{HOOK_NAME}}: Ошибка в useEffect', error);
    }
  }, []);

  return {
    // Возвращаемые значения
  };
};
`;
  }

  // Шаблон провайдера
  getProviderTemplate() {
    return `import React, { createContext, useContext, useCallback, useState } from 'react';

interface {{PROVIDER_NAME}}ContextType {
  // Добавьте контекст
}

const {{PROVIDER_NAME}}Context = createContext<{{PROVIDER_NAME}}ContextType | undefined>(undefined);

interface {{PROVIDER_NAME}}ProviderProps {
  children: React.ReactNode;
}

export const {{PROVIDER_NAME}}Provider: React.FC<{{PROVIDER_NAME}}ProviderProps> = ({ children }) => {
  const [state, setState] = useState();

  // Безопасная установка состояния
  const safeSetState = useCallback((updater: any) => {
    try {
      setState(updater);
    } catch (error) {
      console.error('{{PROVIDER_NAME}}Provider: Ошибка установки состояния', error);
    }
  }, []);

  const value = {
    // Значения контекста
  };

  return (
    <{{PROVIDER_NAME}}Context.Provider value={value}>
      {children}
    </{{PROVIDER_NAME}}Context.Provider>
  );
};

// Хук для использования контекста
export const use{{PROVIDER_NAME}} = () => {
  const context = useContext({{PROVIDER_NAME}}Context);
  if (!context) {
    throw new Error('use{{PROVIDER_NAME}} должен использоваться внутри {{PROVIDER_NAME}}Provider');
  }
  return context;
};
`;
  }

  // Шаблон экрана
  getScreenTemplate() {
    return `import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface {{SCREEN_NAME}}ScreenProps {
  // Добавьте пропсы экрана
}

export const {{SCREEN_NAME}}Screen: React.FC<{{SCREEN_NAME}}ScreenProps> = ({
  // Добавьте пропсы
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Содержимое экрана */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
`;
  }

  // Генерация компонента
  generateComponent(name, type = 'component') {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`Неизвестный тип: ${type}`);
    }

    const content = template
      .replace(/{{COMPONENT_NAME}}/g, name)
      .replace(/{{HOOK_NAME}}/g, name)
      .replace(/{{PROVIDER_NAME}}/g, name)
      .replace(/{{SCREEN_NAME}}/g, name);

    const directory = this.getDirectory(type);
    const filePath = path.join(directory, `${name}.tsx`);

    // Создаем директорию если не существует
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Записываем файл
    fs.writeFileSync(filePath, content);
    console.log(`✅ Создан ${type}: ${filePath}`);

    return filePath;
  }

  // Получение директории по типу
  getDirectory(type) {
    const directories = {
      component: 'app/components',
      hook: 'app/hooks',
      provider: 'app/providers',
      screen: 'app/screens'
    };
    return directories[type] || 'app/components';
  }

  // Автоматическое создание компонентов из анализа
  generateFromAnalysis(analysis) {
    const suggestions = analysis.suggestions || [];
    
    suggestions.forEach(suggestion => {
      if (suggestion.message.includes('разделение')) {
        const fileName = suggestion.file.split('/').pop().replace('.tsx', '');
        this.generateComponent(`${fileName}Part`, 'component');
      }
    });
  }
}

// Если запущен напрямую
if (require.main === module) {
  const generator = new ComponentGenerator();
  
  // Примеры использования
  if (process.argv.length > 2) {
    const name = process.argv[2];
    const type = process.argv[3] || 'component';
    
    try {
      generator.generateComponent(name, type);
    } catch (error) {
      console.error('❌ Ошибка создания компонента:', error.message);
    }
  } else {
    console.log('📝 Использование: node component-generator.js <имя> [тип]');
    console.log('📝 Типы: component, hook, provider, screen');
  }
}

module.exports = ComponentGenerator;
