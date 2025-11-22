# AlMurshid 🧭 - AI-Powered Guide

An intelligent AI assistant powered by **DeepSeek V3**, built with modern web technologies and full RTL support for Arabic language.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI (RTL supported)
- **Backend**: Supabase (Authentication & Database)
- **AI**: DeepSeek V3 via Vercel AI SDK
- **Hosting**: Vercel

## 📋 Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Supabase account ([Sign up here](https://supabase.com))
- A DeepSeek API key ([Get one here](https://platform.deepseek.com))

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API Configuration
OPENAI_API_KEY=your_deepseek_api_key
```

#### Getting Your Supabase Credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy your `Project URL` and `anon/public` key

#### Getting Your DeepSeek API Key:
1. Visit [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
AlMurshid/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # DeepSeek AI API endpoint
│   ├── chat/
│   │   └── page.tsx          # Chat interface
│   ├── layout.tsx            # Root layout with RTL support
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   └── ui/                   # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Supabase client (browser)
│   │   ├── server.ts         # Supabase client (server)
│   │   └── middleware.ts     # Auth middleware
│   └── utils.ts              # Utility functions
├── middleware.ts             # Next.js middleware
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🎨 Features

- ✅ Next.js 15 with App Router
- ✅ TypeScript for type safety
- ✅ Tailwind CSS with RTL support
- ✅ Shadcn/UI components
- ✅ Supabase authentication ready
- ✅ DeepSeek V3 AI integration
- ✅ Real-time chat interface
- ✅ Responsive design
- ✅ Arabic language support

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Deployment to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
5. Deploy!

Vercel will automatically detect Next.js and configure the build settings.

## 📝 Usage

### Chat with DeepSeek AI

Navigate to `/chat` to start chatting with the AI assistant. The interface supports:
- Real-time streaming responses
- RTL layout for Arabic text
- Message history
- Clean, modern UI

### Supabase Integration

The Supabase client is configured for:
- Authentication (ready to implement)
- Database operations (ready to implement)
- Real-time subscriptions (ready to implement)

Example usage in your components:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('your_table').select()
```

## 🔐 Security Notes

- Never commit `.env.local` to version control
- Keep your API keys secure
- Use Supabase Row Level Security (RLS) for database protection
- Follow Vercel security best practices

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Visit [Supabase Documentation](https://supabase.com/docs)
3. Review [DeepSeek API Documentation](https://platform.deepseek.com/docs)
4. Open an issue in this repository

---

Built with ❤️ using the latest web technologies