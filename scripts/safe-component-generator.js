const fs = require('fs');
const path = require('path');
const RegressionGuard = require('./regression-guard');

class SafeComponentGenerator {
  constructor() {
    this.guard = new RegressionGuard();
    this.templates = {
      component: this.getComponentTemplate(),
      hook: this.getHookTemplate(),
      provider: this.getProviderTemplate(),
      screen: this.getScreenTemplate()
    };
  }

  // Создать компонент с защитой
  async createComponent(type, name, options = {}) {
    console.log(`🛡️ Создаю ${type}: ${name} с защитой...`);
    
    // Активируем защиту
    if (!this.guard.guardBeforeChanges()) {
      console.log('❌ Защита не активирована, отменяю создание');
      return false;
    }

    try {
      const template = this.templates[type];
      if (!template) {
        console.log(`❌ Неизвестный тип: ${type}`);
        return false;
      }

      const fileName = `${name}.tsx`;
      const filePath = path.join('app/components', fileName);
      
      // Проверяем, не существует ли уже файл
      if (fs.existsSync(filePath)) {
        console.log(`⚠️ Файл ${fileName} уже существует`);
        return false;
      }

      // Создаем компонент с правильными пропсами
      const content = template(name, options);
      fs.writeFileSync(filePath, content);
      
      console.log(`✅ Создан ${type}: ${fileName}`);
      
      // Проверяем целостность после создания
      if (this.guard.checkComponentIntegrity()) {
        console.log('✅ Целостность проверена после создания');
        return true;
      } else {
        console.log('⚠️ Проблемы целостности, откатываю...');
        fs.unlinkSync(filePath);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка создания компонента:', error.message);
      return false;
    }
  }

  // Безопасное разделение компонента
  async splitComponent(sourceFile, newComponents = []) {
    console.log(`🛡️ Разделяю компонент: ${sourceFile}`);
    
    if (!this.guard.guardBeforeChanges()) {
      console.log('❌ Защита не активирована');
      return false;
    }

    try {
      if (!fs.existsSync(sourceFile)) {
        console.log(`❌ Файл не найден: ${sourceFile}`);
        return false;
      }

      const sourceContent = fs.readFileSync(sourceFile, 'utf8');
      const originalSize = fs.statSync(sourceFile).size;

      // Создаем новые компоненты
      for (const component of newComponents) {
        const success = await this.createComponent(
          component.type, 
          component.name, 
          component.options
        );
        
        if (!success) {
          console.log(`❌ Не удалось создать ${component.name}`);
          return false;
        }
      }

      // Проверяем, что исходный файл не сломался
      if (fs.existsSync(sourceFile)) {
        const newSize = fs.statSync(sourceFile).size;
        if (newSize < originalSize * 0.5) {
          console.log('⚠️ Исходный файл слишком уменьшился, проверьте логику');
        }
      }

      console.log('✅ Разделение завершено успешно');
      return true;
    } catch (error) {
      console.error('❌ Ошибка разделения:', error.message);
      return false;
    }
  }

  // Шаблоны компонентов
  getComponentTemplate() {
    return (name, options = {}) => {
      const props = options.props || '{}';
      const hasState = options.hasState !== false;
      const hasStyles = options.hasStyles !== false;
      
      return `import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface ${name}Props ${props}

export const ${name}: React.FC<${name}Props> = React.memo((props) => {
  ${hasState ? `
  // Состояние компонента
  const [state, setState] = React.useState({});
  
  // Безопасное изменение состояния
  const safeSetState = useCallback((newState: any) => {
    try {
      setState(newState);
    } catch (error) {
      console.error('${name}: Ошибка изменения состояния', error);
    }
  }, []);` : ''}

  // Мемоизированные значения
  const memoizedValue = useMemo(() => {
    try {
      return {}; // Ваша логика
    } catch (error) {
      console.error('${name}: Ошибка вычисления значения', error);
      return {};
    }
  }, []);

  // Обработчики событий
  const handlePress = useCallback(() => {
    try {
      // Ваша логика
    } catch (error) {
      console.error('${name}: Ошибка обработки события', error);
    }
  }, []);

  try {
    return (
      <View style={styles.container}>
        {/* Ваш контент */}
      </View>
    );
  } catch (error) {
    console.error('${name}: Критическая ошибка рендеринга', error);
    return (
      <View style={styles.fallbackContainer}>
        {/* Fallback UI */}
      </View>
    );
  }
});

${name}.displayName = '${name}';

${hasStyles ? `const styles = StyleSheet.create({
  container: {
    // Ваши стили
  },
  fallbackContainer: {
    // Fallback стили
  },
});` : ''}
`;
    };
  }

  getHookTemplate() {
    return (name, options = {}) => {
      return `import { useCallback, useEffect, useState } from 'react';

export const use${name} = (initialValue?: any) => {
  const [value, setValue] = useState(initialValue);

  // Безопасное изменение значения
  const safeSetValue = useCallback((newValue: any) => {
    try {
      setValue(newValue);
    } catch (error) {
      console.error('use${name}: Ошибка изменения значения', error);
    }
  }, []);

  // Эффект
  useEffect(() => {
    try {
      // Ваша логика
    } catch (error) {
      console.error('use${name}: Ошибка эффекта', error);
    }
  }, []);

  return {
    value,
    setValue: safeSetValue,
  };
};
`;
    };
  }

  getProviderTemplate() {
    return (name, options = {}) => {
      return `import React, { createContext, useContext, useCallback, useMemo } from 'react';

interface ${name}ContextType {
  // Ваши типы
}

const ${name}Context = createContext<${name}ContextType | undefined>(undefined);

export const use${name} = () => {
  const context = useContext(${name}Context);
  if (!context) {
    throw new Error('use${name} должен использоваться внутри ${name}Provider');
  }
  return context;
};

interface ${name}ProviderProps {
  children: React.ReactNode;
}

export const ${name}Provider: React.FC<${name}ProviderProps> = React.memo(({ children }) => {
  // Состояние провайдера
  const [state, setState] = React.useState({});

  // Безопасное изменение состояния
  const safeSetState = useCallback((newState: any) => {
    try {
      setState(newState);
    } catch (error) {
      console.error('${name}Provider: Ошибка изменения состояния', error);
    }
  }, []);

  // Мемоизированное значение контекста
  const contextValue = useMemo(() => {
    try {
      return {
        state,
        setState: safeSetState,
      };
    } catch (error) {
      console.error('${name}Provider: Ошибка создания контекста', error);
      return {
        state: {},
        setState: () => {},
      };
    }
  }, [state, safeSetState]);

  try {
    return (
      <${name}Context.Provider value={contextValue}>
        {children}
      </${name}Context.Provider>
    );
  } catch (error) {
    console.error('${name}Provider: Критическая ошибка рендеринга', error);
    return <>{children}</>;
  }
});

${name}Provider.displayName = '${name}Provider';
`;
    };
  }

  getScreenTemplate() {
    return (name, options = {}) => {
      return `import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ${name}ScreenProps {
  // Ваши пропсы
}

export const ${name}Screen: React.FC<${name}ScreenProps> = React.memo((props) => {
  // Состояние экрана
  const [state, setState] = React.useState({});

  // Безопасное изменение состояния
  const safeSetState = useCallback((newState: any) => {
    try {
      setState(newState);
    } catch (error) {
      console.error('${name}Screen: Ошибка изменения состояния', error);
    }
  }, []);

  // Мемоизированные значения
  const memoizedValue = useMemo(() => {
    try {
      return {}; // Ваша логика
    } catch (error) {
      console.error('${name}Screen: Ошибка вычисления значения', error);
      return {};
    }
  }, []);

  // Обработчики событий
  const handlePress = useCallback(() => {
    try {
      // Ваша логика
    } catch (error) {
      console.error('${name}Screen: Ошибка обработки события', error);
    }
  }, []);

  try {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>${name}</Text>
          {/* Ваш контент */}
        </View>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('${name}Screen: Критическая ошибка рендеринга', error);
    return (
      <SafeAreaView style={styles.fallbackContainer}>
        <Text style={styles.fallbackText}>
          Произошла ошибка. Попробуйте перезапустить приложение.
        </Text>
      </SafeAreaView>
    );
  }
});

${name}Screen.displayName = '${name}Screen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fallbackText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
`;
    };
  }
}

// Экспорт для использования
module.exports = SafeComponentGenerator;

// Если запущен напрямую
if (require.main === module) {
  const generator = new SafeComponentGenerator();
  
  const command = process.argv[2];
  const type = process.argv[3];
  const name = process.argv[4];
  
  switch (command) {
    case 'create':
      if (!type || !name) {
        console.log('Использование: node scripts/safe-component-generator.js create <type> <name>');
        break;
      }
      generator.createComponent(type, name);
      break;
    case 'split':
      console.log('Функция разделения в разработке...');
      break;
    default:
      console.log(`
🛡️ Safe Component Generator - Безопасный генератор компонентов

Использование:
  node scripts/safe-component-generator.js create <type> <name>
  
Типы:
  - component
  - hook  
  - provider
  - screen
      `);
  }
}
