# Restaurant Location Analyzer

A comprehensive Vue.js application with a Node.js BFF (Backend for Frontend) that analyzes restaurant locations across multiple platforms and provides actionable insights to improve online visibility and branding.

## Architecture

This application uses a **Client-Server architecture**:
- **Client**: Vue.js application (frontend)
- **Server**: Node.js + Express BFF (Backend for Frontend) for proxying Slack API requests and avoiding CORS issues

## Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation & Setup

1. **Install client dependencies:**
   ```bash
   npm install
   ```

2. **Install server dependencies:**
   ```bash
   npm run server:install
   ```

3. **Configure environment variables:**
   
   **For the server** (create `server/.env`):
   ```env
   PORT=3001
   CLIENT_URL=http://localhost:5173
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   ```
   
   **For the client** (update your `.env`):
   ```env
   # Add this to your existing .env file
   VITE_BFF_URL=http://localhost:3001
   ```

### Running the Application

**Development mode (recommended):**
```bash
npm run dev:full
```
This starts both client (port 5173) and server (port 3001) simultaneously.

**Or run separately:**
```bash
# Terminal 1 - Start BFF server
npm run server:dev

# Terminal 2 - Start client
npm run dev
```

## Features

### 🔍 Multi-Platform Analysis
- **Google Maps Integration**: Search and analyze restaurant presence on Google
- **Yandex Maps Integration**: Focus on Kazakhstan region with Yandex data
- **2GIS Integration**: Local business discovery platform analysis
- **Website Analysis**: Automated website detection and SEO evaluation

### 📊 Comprehensive Scoring System
- **Visibility Score**: Measures online presence across platforms
- **Branding Score**: Evaluates brand consistency and completeness
- **Overall Score**: Combined metric for holistic assessment

### 🎯 Smart Recommendations
- Prioritized action items based on potential revenue impact
- Platform-specific suggestions (Google My Business, Yandex, 2GIS)
- Social media presence optimization
- Website and SEO improvements
- Online ordering and delivery setup guidance

### 🇰🇿 Kazakhstan-Focused
- Specialized search for Kazakhstan region
- Support for major Kazakhstani cities
- Regional business discovery platforms

### 📢 Slack Integration
- **Full Analysis Notifications**: Complete onboarding data including restaurant details, business metrics, problems, goals, and contact information
- **Smart Analysis Notifications**: Quick analysis results with contact information and location data
- **Structured Messages**: Rich formatting with organized sections for easy reading
- **Contact Information**: Visitor name, phone, position, and privacy consent tracking
- **Location Data**: Restaurant name, address, city, coordinates for future integrations

## Tech Stack

- **Frontend**: Vue 3 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Pinia
- **API Integration**: Axios
- **Build Tool**: Vite
- **Icons**: Lucide Vue

## API Integrations

### Google Search API
- Restaurant search and discovery
- Website detection and analysis
- Custom search engine integration

### Yandex Maps API
- Geocoding and place search
- Location data extraction
- Kazakhstan-specific optimization

### 2GIS API
- Business listing search
- Detailed place information
- Local business data

### Slack Integration
- Webhook notifications for completed analyses
- Contact information collection and forwarding
- Full analysis data including onboarding details
- Smart analysis data with location information

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for Google, Yandex, and 2GIS
- Slack workspace with webhook URL (optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd restaurant-location-analyzer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
VITE_GOOGLE_SEARCH_API_KEY=your_google_api_key
VITE_YANDEX_API_KEY=your_yandex_api_key
VITE_TWOGIS_API_KEY=your_2gis_api_key
VITE_SLACK_WEBHOOK_URL=your_slack_webhook_url
```

#### Setting up Slack Integration
1. Go to your Slack workspace
2. Create a new app or use an existing one
3. Enable "Incoming Webhooks" feature
4. Create a new webhook for your desired channel
5. Copy the webhook URL and add it to your `.env` file
6. The integration will automatically send formatted messages when analyses are completed

4. Start the development server
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

## Usage

### Basic Analysis Flow

1. **Search for Restaurant**: Enter the restaurant name in the search field
2. **Select Location**: Choose from the dropdown of found locations
3. **Run Analysis**: Click "Analyze Restaurant" to start the comprehensive analysis
4. **Review Results**: Examine scores and recommendations
5. **Implement Suggestions**: Follow prioritized recommendations to improve online presence

### Understanding Scores

#### Visibility Score (0-100)
- **Platform Presence**: Points for being listed on Google, Yandex, 2GIS
- **Website Presence**: Additional points for having an official website
- **Reviews & Ratings**: Score based on average rating and review count
- **Online Services**: Points for online ordering and delivery options

#### Branding Score (0-100)
- **Information Completeness**: Points for complete business information
- **Social Media Presence**: Facebook, Instagram, VK presence
- **Website Quality**: SEO score and website functionality
- **Consistency**: Matching information across platforms

### Recommendations Priority

1. **High Priority**: Website creation, Google My Business listing
2. **Medium Priority**: Social media presence, additional platform listings
3. **Low Priority**: SEO improvements, photo additions, review management

## Project Structure

```
src/
├── components/          # Reusable Vue components
├── composables/        # Vue composition functions
├── services/           # API service layers
│   ├── googleMapsService.ts
│   ├── yandexMapsService.ts
│   ├── twoGisService.ts
│   ├── websiteAnalysisService.ts
│   └── scoringService.ts
├── types/              # TypeScript type definitions
├── views/              # Page components
├── router/             # Vue Router configuration
└── style.css           # Global styles
```

## Key Components

### Services
- **GoogleMapsService**: Handles Google API integration
- **YandexMapsService**: Manages Yandex API calls
- **TwoGisService**: Processes 2GIS API data
- **WebsiteAnalysisService**: Analyzes restaurant websites
- **ScoringService**: Calculates scores and generates recommendations

### Composables
- **useRestaurantAnalysis**: Main analysis logic and state management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## API Rate Limits

- **Google Search API**: 100 queries per day (free tier)
- **Yandex Maps API**: 1000 requests per day (free tier)
- **2GIS API**: 10,000 requests per day (free tier)

## Troubleshooting

### Common Issues

1. **API Key Errors**: Ensure all API keys are properly set in the `.env` file
2. **CORS Issues**: Use proper API endpoints that support CORS
3. **Rate Limits**: Implement proper error handling for API limits
4. **Search Results**: Some restaurants might not appear if they have limited online presence

### Development Tips

1. Use browser dev tools to monitor API calls
2. Check the console for detailed error messages
3. Test with well-known restaurants first
4. Verify API keys are active and have proper permissions

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

**Note**: This application is designed specifically for the Kazakhstan market and may require modifications for other regions. 