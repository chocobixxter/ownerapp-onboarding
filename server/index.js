import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

// ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true)
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4173', // Vite preview
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Production domains
      'https://owner-app.onrender.com',
      'https://owner-app.render.com'
    ]
    
    // In production, also allow requests from the same domain
    if (process.env.NODE_ENV === 'production') {
      const host = process.env.RENDER_EXTERNAL_URL || `https://owner-app.onrender.com`
      allowedOrigins.push(host)
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}

app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`🚨 General rate limit exceeded for IP: ${req.ip}, Path: ${req.path}, Time: ${new Date().toISOString()}`)
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again after 15 minutes.',
      retryAfter: '15 minutes'
    })
  }
})

const slackLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limit each IP to 10 Slack requests per 5 minutes
  message: {
    success: false,
    error: 'Too many Slack requests from this IP. Please wait before sending more notifications.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for requests from trusted origins in development
    const trustedOrigins = ['http://localhost:5173', 'http://localhost:3000']
    const origin = req.get('Origin') || req.get('Referer')?.replace(/\/$/, '')
    return process.env.NODE_ENV === 'development' && trustedOrigins.some(trusted => origin?.startsWith(trusted))
  },
  handler: (req, res) => {
    console.warn(`🚨 Slack rate limit exceeded for IP: ${req.ip}, Origin: ${req.get('Origin')}, Time: ${new Date().toISOString()}`)
    res.status(429).json({
      success: false,
      error: 'Too many Slack requests from this IP. Please wait before sending more notifications.',
      retryAfter: '5 minutes'
    })
  }
})

const testLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 test requests per 15 minutes
  message: {
    success: false,
    error: 'Too many test requests from this IP. Please wait before testing again.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`🚨 Test rate limit exceeded for IP: ${req.ip}, Time: ${new Date().toISOString()}`)
    res.status(429).json({
      success: false,
      error: 'Too many test requests from this IP. Please wait before testing again.',
      retryAfter: '15 minutes'
    })
  }
})

// Apply general rate limiting to API requests only (exclude health checks and static files)
app.use('/api/', generalLimiter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    rateLimiting: {
      enabled: true,
      general: '100 requests per 15 minutes',
      slack: '10 requests per 5 minutes',
      test: '5 requests per 15 minutes'
    }
  })
})

// Rate limiting status endpoint (for monitoring)
app.get('/api/rate-limit-status', (req, res) => {
  res.json({
    rateLimiting: {
      general: {
        windowMs: '15 minutes',
        max: 100,
        description: 'General API rate limit'
      },
      slack: {
        windowMs: '5 minutes', 
        max: 10,
        description: 'Slack webhook rate limit',
        developmentSkip: 'Trusted origins skipped in development'
      },
      test: {
        windowMs: '15 minutes',
        max: 5,
        description: 'Test endpoint rate limit'
      }
    },
    headers: {
      standard: 'RateLimit-* headers included',
      legacy: 'X-RateLimit-* headers disabled'
    }
  })
})

// Slack webhook proxy endpoint
app.post('/api/slack/webhook', slackLimiter, async (req, res) => {
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    
    if (!slackWebhookUrl) {
      console.error('❌ SLACK_WEBHOOK_URL not configured in environment variables')
      return res.status(500).json({
        success: false,
        error: 'Slack webhook URL not configured'
      })
    }

    const slackMessage = req.body

    console.log('📤 Forwarding message to Slack:', {
      timestamp: new Date().toISOString(),
      messageType: slackMessage.text || 'Unknown',
      hasBlocks: !!slackMessage.blocks
    })

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(slackMessage)
    })

    if (response.ok) {
      console.log('✅ Slack message sent successfully')
      res.json({
        success: true,
        message: 'Slack notification sent successfully'
      })
    } else {
      const errorText = await response.text()
      console.error('❌ Slack API error:', response.status, response.statusText, errorText)
      res.status(response.status).json({
        success: false,
        error: `Slack API error: ${response.status} ${response.statusText}`,
        details: errorText
      })
    }
  } catch (error) {
    console.error('❌ Server error while sending to Slack:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
})

// Test endpoint for Slack integration
app.post('/api/slack/test', testLimiter, async (req, res) => {
  try {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
    
    if (!slackWebhookUrl) {
      return res.status(500).json({
        success: false,
        error: 'Slack webhook URL not configured'
      })
    }

    const testMessage = {
      text: "Тестовое сообщение от Restaurant Analyzer BFF",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "🧪 *Тест BFF интеграции со Slack*\nЭто тестовое сообщение для проверки работы BFF сервера."
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Server:*\nBFF Node.js + Express`
            },
            {
              type: "mrkdwn",
              text: `*Время:*\n${new Date().toLocaleString('ru-RU')}`
            }
          ]
        }
      ]
    }

    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    })

    if (response.ok) {
      console.log('✅ Slack test message sent successfully')
      res.json({
        success: true,
        message: 'Test Slack notification sent successfully'
      })
    } else {
      const errorText = await response.text()
      console.error('❌ Slack test failed:', response.status, errorText)
      res.status(response.status).json({
        success: false,
        error: `Slack API error: ${response.status} ${response.statusText}`,
        details: errorText
      })
    }
  } catch (error) {
    console.error('❌ Server error during Slack test:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    })
  }
})

// Serve static files from the dist directory (built frontend)
const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({
      success: false,
      error: 'API endpoint not found',
      path: req.originalUrl
    })
  }
  
  // Serve index.html for SPA routes
  res.sendFile(path.join(distPath, 'index.html'))
})

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled server error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: error.message
  })
})

app.listen(PORT, () => {
  console.log(`🚀 BFF Server running on port ${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Slack webhook proxy: http://localhost:${PORT}/api/slack/webhook`)
  console.log(`🧪 Slack test endpoint: http://localhost:${PORT}/api/slack/test`)
  console.log(`📊 Rate limit status: http://localhost:${PORT}/api/rate-limit-status`)
  console.log(`🛡️ Rate limiting enabled:`)
  console.log(`   • General: 100 req/15min`)
  console.log(`   • Slack: 10 req/5min`)
  console.log(`   • Test: 5 req/15min`)
}) 