# 🚀 Деплой на Render

## Быстрый старт

1. **Зайдите на [render.com](https://render.com)**
2. **Войдите через GitHub аккаунт**
3. **Создайте новый Web Service:**
   - Нажмите "New" → "Web Service"
   - Выберите ваш GitHub репозиторий
   - Render автоматически обнаружит `render.yaml`

## 🔧 Настройка переменных окружения

В панели Render добавьте следующие переменные:

### Обязательные:
- `SLACK_WEBHOOK_URL` - ваш Slack webhook URL

### Опциональные:
- `NODE_ENV` - автоматически установлен в `production`
- `PORT` - автоматически установлен в `10000`

## 📁 Структура деплоя

```
Фронтенд (Vue.js) → Собирается в /dist
Бэкенд (Node.js) → Сервирует API + статические файлы
```

## 🌐 После деплоя

- **URL приложения**: https://owner-app.onrender.com
- **Health Check**: https://owner-app.onrender.com/health
- **API тест**: https://owner-app.onrender.com/api/rate-limit-status

## 🔄 Автодеплой

- Каждый push в `main` ветку автоматически деплоит приложение
- Время деплоя: ~5-10 минут
- Логи доступны в панели Render

## 🐛 Отладка

Если что-то не работает:

1. **Проверьте логи** в панели Render
2. **Убедитесь**, что `SLACK_WEBHOOK_URL` настроен
3. **Проверьте health check**: `/health`

## 📝 Полезные команды для локальной разработки

```bash
# Полная сборка (как на Render)
npm install && npm run build && cd server && npm install --production

# Запуск в продакшн режиме
cd server && npm start

# Разработка
npm run dev:full
``` 