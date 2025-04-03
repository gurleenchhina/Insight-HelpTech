# HelpTech Pest Control App

This is the Next.js version of the HelpTech Pest Control application, designed for pest control technicians in Ontario, Canada.

## Features

- AI-powered pest control recommendations
- Search for pest control solutions with natural language
- Browse pest categories and treatment guidelines
- Mobile-friendly responsive design
- Ontario-specific compliance with regulations

## Project Structure

```
/app                  # Next.js App Router pages
  /api                # API routes
  /pests              # Pest category pages
/components           # React components
/lib                  # Utility functions and database adapter
```

## Getting Started

To run this application locally:

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

- `POST /api/search` - Process search queries with AI
- `GET /api/recent-searches` - Get recent search history
- `GET /api/pest-categories` - Get all pest categories

## Technologies Used

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- DeepSeek AI via OpenRouter for recommendations

## Deployment

This app can be deployed on Vercel, Netlify, or any other Next.js-compatible hosting platform.

To build for production:

```bash
npm run build
```

## License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents is strictly prohibited.