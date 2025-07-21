# Owner App BFF Server

Backend for Frontend (BFF) сервер для проксирования запросов к Slack API и избежания CORS проблем.

## Установка

```bash
cd server
npm install
```

## Настройка переменных окружения

Создайте файл `.env` в папке `server/` со следующими переменными:

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:5173

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## Запуск

### Режим разработки
```bash
npm run dev
```

### Продакшн
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Проверка состояния сервера. Возвращает информацию о rate limiting.

### Slack Webhook Proxy
```
POST /api/slack/webhook
```
Проксирование сообщений в Slack. Принимает JSON с данными сообщения.
- **Rate limit**: 10 запросов в 5 минут
- **Development**: Доверенные origins (`localhost:3000`, `localhost:5173`) пропускаются

### Slack Test
```
POST /api/slack/test
```
Отправка тестового сообщения в Slack для проверки интеграции.
- **Rate limit**: 5 запросов в 15 минут

### Rate Limit Status
```
GET /api/rate-limit-status
```
Информация о конфигурации rate limiting для мониторинга.

## Rate Limiting & Security

### Защита от DDOS
Сервер защищен многоуровневой системой rate limiting:

1. **Общий лимит**: 100 запросов в 15 минут для всех endpoints
2. **Slack лимит**: 10 запросов в 5 минут для Slack endpoints 
3. **Test лимит**: 5 запросов в 15 минут для тестового endpoint

### Заголовки Rate Limiting
Все ответы включают стандартные заголовки:
- `RateLimit-Policy`: Политика лимитирования
- `RateLimit-Limit`: Максимальное количество запросов
- `RateLimit-Remaining`: Оставшееся количество запросов
- `RateLimit-Reset`: Время до сброса лимита (в секундах)

### Обработка превышения лимита
При превышении лимита:
- Возвращается HTTP 429 (Too Many Requests)
- JSON ответ с описанием ошибки и временем ожидания
- Логирование попыток в консоли с IP адресом и временем

### Development режим
В development режиме доверенные origins (`localhost:3000`, `localhost:5173`) 
пропускают Slack rate limiting для удобства разработки.

## Использование

Сервер автоматически проксирует все запросы к Slack webhook, добавляя необходимые CORS заголовки и обрабатывая ошибки.

Клиентское приложение должно отправлять запросы на `http://localhost:3001/api/slack/webhook` вместо прямого обращения к Slack API. 