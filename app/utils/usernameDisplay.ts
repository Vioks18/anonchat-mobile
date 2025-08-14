/**
 * Утилиты для отображения username
 */

/**
 * Добавляет @ к username для отображения
 * @param username - username без @
 * @returns username с @ для отображения
 */
export function displayUsername(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username : `@${username}`;
}

/**
 * Убирает @ из username для сохранения
 * @param username - username с @ или без
 * @returns username без @ для сохранения
 */
export function normalizeUsernameForStorage(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username.slice(1) : username;
}

/**
 * Проверяет, содержит ли username @
 * @param username - username для проверки
 * @returns true если username содержит @
 */
export function hasAtSymbol(username: string): boolean {
  return username.startsWith('@');
}
