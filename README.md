# DropshipAI - AI-Powered Dropshipping Assistant

An intelligent branding and marketing assistant that helps dropshippers generate compelling brand identities, taglines, and marketing assets using AI.

## Features

- 🤖 **AI-Powered Branding**: Generate brand names, taglines, and landing page copy
- 🎯 **Helix Personas**: Target specific customer segments with data-driven insights
- 📍 **Local Market Focus**: Optimize for specific suburbs and postcodes
- 📱 **Multi-Platform Ads**: Create Facebook, Google, and TikTok ad variants
- 💰 **Budget Strategy**: Get recommended ad platforms and spending strategies
- 📊 **Project History**: Store and manage all your branding projects
- 🔐 **User Authentication**: Secure login/signup with Supabase
- 📱 **Mobile Responsive**: Beautiful UI that works on all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (Auth + Database), Railway for deployment
- **AI**: OpenAI GPT-4 API
- **State Management**: React Context
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- Railway account (for deployment)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd dropship-ai-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Supabase Database**
   
   Create the following tables in your Supabase project:

   ```sql
   -- Users table (handled by Supabase Auth)
   -- projects table
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     product_name TEXT NOT NULL,
     product_description TEXT,
     target_persona TEXT NOT NULL,
     locality TEXT NOT NULL,
     brand_tone TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- outputs table
   CREATE TABLE outputs (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
     brand_name TEXT NOT NULL,
     tagline TEXT NOT NULL,
     landing_page_copy TEXT NOT NULL,
     ad_headlines TEXT[] NOT NULL,
     tiktok_scripts TEXT[] NOT NULL,
     ad_platforms TEXT[] NOT NULL,
     budget_strategy TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own projects" ON projects
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own projects" ON projects
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can view own outputs" ON outputs
     FOR SELECT USING (
       project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
     );

   CREATE POLICY "Users can insert own outputs" ON outputs
     FOR INSERT WITH CHECK (
       project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
     );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
dropship-ai-helper/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/             # React components
│   ├── Form.tsx           # Product input form
│   └── OutputDisplay.tsx  # Generated output display
├── lib/                    # Utility libraries
│   ├── auth-context.tsx   # Authentication context
│   ├── gpt.ts             # OpenAI integration
│   └── supabase.ts        # Supabase client
├── prompts/                # AI prompt templates
│   └── branding.ts        # Branding generation prompt
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Usage

1. **Sign up/Login**: Create an account or sign in to your existing account
2. **Fill the Form**: Enter your product details, target persona, location, and brand tone
3. **Generate**: Click "Generate Branding Package" to create your assets
4. **Review**: Examine the generated brand name, tagline, ads, and strategy
5. **Regenerate**: Use the regenerate button to create new variations
6. **History**: View all your past projects in the history section

## Deployment to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway project**
   ```bash
   railway init
   ```

4. **Set environment variables in Railway dashboard**
   - Go to your project settings
   - Add the same environment variables from your `.env.local`

5. **Deploy**
   ```bash
   railway up
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |

## API Endpoints

- `POST /api/generate-branding` - Generate branding package
  - Body: `{ product, persona, tone, location, userId }`
  - Returns: Complete branding package with ads and strategy

## Customization

### Adding New Helix Personas
Edit the `HELIX_PERSONAS` array in `components/Form.tsx`

### Adding New Brand Tones
Edit the `BRAND_TONES` array in `components/Form.tsx`

### Modifying AI Prompts
Edit the prompt template in `prompts/branding.ts`

### Styling
Modify `tailwind.config.js` and `app/globals.css` for custom styling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@dropshipai.com or create an issue in this repository.

## Roadmap

- [ ] PDF export functionality
- [ ] More ad platform templates
- [ ] A/B testing for ad variations
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] API rate limiting and usage tracking

