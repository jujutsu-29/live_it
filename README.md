# StreamLive - Live-to-YouTube Booking Service

A production-ready Next.js web application for booking and managing live streaming sessions to YouTube.

## Features

- **Landing Page**: Professional marketing site with feature highlights
- **Authentication**: Email/password and OAuth (Google) sign-in/sign-up
- **Dashboard**: Booking history, analytics, and quick actions
- **Scheduling**: Interactive calendar with time slot booking and Stripe payment integration
- **Studio**: Full-featured streaming interface with WebRTC, camera/mic controls, and live chat
- **YouTube Integration**: OAuth connection and stream management
- **Responsive Design**: Dark studio theme optimized for streaming environments

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: React hooks with SWR for data fetching
- **Authentication**: Mock OAuth and email/password system
- **Payments**: Stripe integration (mock)
- **Streaming**: WebRTC with YouTube Live API integration (mock)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:3000/api

# YouTube Integration
YOUTUBE_CLIENT_ID=your-youtube-client-id
YOUTUBE_CLIENT_SECRET=your-youtube-client-secret

# Stripe Payment Processing
STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Optional: Development redirect URL for Supabase auth
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd streamlive-booking
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Set up environment variables (see above)

4. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes (mock endpoints)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── schedule/          # Booking interface
│   ├── studio/            # Streaming studio
│   ├── globals.css        # Global styles with dark theme
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── auth-context.tsx  # Authentication provider
│   ├── auth-guard.tsx    # Route protection
│   └── navigation.tsx    # Main navigation
└── lib/                  # Utility functions
    └── utils.ts          # Common utilities
\`\`\`

## API Endpoints

The application includes mock API endpoints that return realistic sample responses:

### Authentication
- `GET/POST /api/oauth/youtube` - YouTube OAuth flow
- Mock OAuth redirect and token exchange

### Booking Management  
- `GET/POST/PUT/DELETE /api/schedule` - Booking CRUD operations
- Handles scheduling, payment processing, and cancellations

### Streaming
- `POST /api/start-stream` - Initialize live stream
- `POST /api/stop-stream` - End stream with analytics
- `GET /api/stream-stats` - Real-time streaming statistics

## Key Features Implementation

### Authentication System
- Email/password registration and login
- Google OAuth integration (mock)
- Protected routes with AuthGuard component
- Persistent session management

### Booking & Scheduling
- Interactive calendar interface
- Time slot availability checking
- Dynamic pricing based on time and duration
- Stripe payment integration (mock)
- Booking confirmation and management

### Streaming Studio
- WebRTC camera/microphone access
- Device selection (camera, microphone)
- Stream settings (resolution, bitrate, volume)
- YouTube account connection status
- Live stream controls (start/stop with countdown)
- Real-time viewer count and chat
- Stream statistics and analytics

### Responsive Design
- Mobile-first approach
- Dark theme optimized for streaming
- Accessible controls with ARIA labels
- Professional studio aesthetic

## TODOs for Production

### YouTube API Integration
1. **OAuth Setup**: Replace mock OAuth with real YouTube API v3
   - Configure OAuth 2.0 credentials in Google Cloud Console
   - Implement proper token refresh mechanism
   - Handle OAuth errors and edge cases

2. **Live Streaming**: Integrate YouTube Live Streaming API
   - Create live broadcasts programmatically
   - Manage stream keys and RTMP endpoints
   - Handle stream status updates and webhooks

3. **Channel Management**: Add channel verification
   - Check streaming eligibility
   - Validate channel permissions
   - Handle channel restrictions

### Media Server Integration
1. **WebRTC Implementation**: Replace mock WebRTC with real implementation
   - Integrate with media servers (Janus, Kurento, or SRS)
   - Implement proper camera/microphone access
   - Add screen sharing functionality
   - Handle media stream encoding and transmission

2. **RTMP Streaming**: Set up RTMP server infrastructure
   - Configure RTMP ingestion endpoints
   - Implement stream transcoding
   - Add adaptive bitrate streaming
   - Monitor stream health and quality

### Payment Processing
1. **Stripe Integration**: Replace mock Stripe with real implementation
   - Set up Stripe webhooks for payment confirmation
   - Implement proper error handling and retries
   - Add refund and cancellation logic
   - Handle subscription billing for premium features

2. **Payment Security**: Implement security best practices
   - PCI compliance measures
   - Secure payment form handling
   - Fraud detection and prevention

### Database & Backend
1. **Database Setup**: Replace localStorage with proper database
   - Set up PostgreSQL or MongoDB
   - Implement proper data models
   - Add database migrations
   - Set up connection pooling

2. **API Security**: Implement authentication and authorization
   - JWT token management
   - Rate limiting and DDoS protection
   - Input validation and sanitization
   - CORS configuration

### Monitoring & Analytics
1. **Stream Analytics**: Implement real-time analytics
   - Viewer engagement tracking
   - Stream quality monitoring
   - Performance metrics collection
   - Custom dashboard creation

2. **Error Monitoring**: Add comprehensive error tracking
   - Sentry or similar error tracking service
   - Performance monitoring
   - Uptime monitoring
   - Alert systems

### Deployment & Infrastructure
1. **Production Deployment**: Set up production infrastructure
   - Vercel deployment configuration
   - CDN setup for static assets
   - Environment variable management
   - SSL certificate configuration

2. **Scalability**: Prepare for scale
   - Load balancing configuration
   - Database optimization
   - Caching strategies (Redis)
   - Auto-scaling policies

## Development Notes

- All API endpoints currently return mock data for demonstration
- WebRTC functionality is simulated - real implementation requires media server
- Stripe integration shows UI flow but doesn't process real payments
- YouTube OAuth flow is mocked - requires real Google Cloud Console setup
- Authentication uses localStorage - replace with secure session management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
