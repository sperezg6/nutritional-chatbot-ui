# Asistente de Nutricion Renal

A conversational AI assistant for kidney disease nutritional guidance. Built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and AWS Lambda.

## Features

- **AI-Powered Chat**: Real-time streaming responses from AWS Lambda backend
- **Conversation History**: Persistent chat history stored in Supabase
- **PDF Export**: Download meal plans as formatted PDFs
- **Feedback System**: User rating and comment collection
- **Dark Mode**: Full light/dark theme support
- **3D Animated Background**: Three.js powered dotted surface animation
- **Progressive Loading**: Dynamic status messages during AI response generation
- **Mobile Responsive**: Optimized for all screen sizes

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Backend | AWS Lambda |
| Animations | Framer Motion, Three.js |
| Icons | Lucide React |
| PDF Generation | jsPDF |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- AWS Lambda endpoint

### Environment Variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Endpoints
NEXT_PUBLIC_API_ENDPOINT=your_lambda_endpoint
NEXT_PUBLIC_STREAMING_ENDPOINT=your_streaming_endpoint
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nutritional-chabtbot-ui/
├── app/
│   ├── api/
│   │   ├── feedback/        # Feedback submission endpoint
│   │   └── generate-pdf/    # PDF generation endpoint
│   ├── chat/
│   │   └── [sessionId]/     # Dynamic chat session pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Welcome screen
├── components/
│   ├── chat/
│   │   ├── feedback-modal.tsx
│   │   ├── history-panel.tsx
│   │   ├── message.tsx
│   │   ├── message-skeleton.tsx
│   │   └── welcome-screen.tsx
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── api.ts               # API client
│   ├── session.ts           # Session management
│   ├── supabase.ts          # Supabase client
│   └── utils.ts
└── types/
    └── index.ts
```

## Database Schema

The app uses Supabase with the following main tables:

- `sessions` - Chat session metadata
- `messages` - Individual chat messages
- `feedback` - User feedback and ratings

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Security

- Security headers configured (X-Frame-Options, X-XSS-Protection, etc.)
- Environment variables for sensitive configuration
- Supabase Row Level Security (RLS) ready

## Medical Disclaimer

This chatbot provides nutritional education for kidney disease patients. It is NOT a substitute for professional medical advice. Always consult your nephrologist or registered dietitian before making dietary changes.

## License

Private - All rights reserved.
