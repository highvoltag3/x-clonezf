# Zellerfeld assesment - X/ Twitter Clone

A simple Twitter-like social media app built using Next.js, TypeScript, and Supabase.

## Features / Requirements
**User Profiles:**
- This view should show basic information
  - [x] username, 
  - [x] profile picture placeholder, etc.
    - [ ]  Personal challenge, if time permits add gravator support
  - [x]  and display a feed of posts associated with that profile.

**Feed:**
- Implement a feed that lists posts. Posts can be simple texts (consider a character limit, e.g., 280 characters).
  - Took the liberty of making this a real-time shows posts in reverse chronological order easilyu thanks to supabase

**Post Creation**
- Allow users to create new posts via the UI.
  - Create posts with 280-character limit

**Pagination** 
- Load more posts with pagination

**Authentication** 
- Magic link authentication with Supabase

**Responsive Design** 
- Did my best to keep it responsive (main reason I chose to use Tailwinds and not just do my own styles / aside form speed)

## Tech Stack used:

**Frontend**: Next.js 15, TypeScript, Tailwind CSS
**Backend**: Next.js API Routes
**Database**: Supabase
**Authentication**: Leveraged Supabase Auth
**Deployment**: Vercel for simplicity 

## Getting Started

### Prerequisites

- Node.js 18+ 
- Supabase account

### Installation

1. Clone the repository
```bash
git clone git@github.com:highvoltag3/x-clonezf.git
cd x-clonezf
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
   - Create a new Supabase project -> `https://supabase.com/`
   - Run the SQL schema from `supabase-schema.sql` in the Supabase SQL editor (it's in the project root)
   - Get the project URL and anon key from Settings > API

4. Configure environment variables
```bash
touch .env.local
```

Update `.env.local` with the Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Data model
![Data Model Screenshot](public/datamodelscreenshot.png)
See `/lib/supabase.ts` for the schema and tigger function I created.

## API Endpoints

### Profile
- `GET /api/profile/[handle]` - Get user profile by handle
- `GET /api/profile/[handle]/posts` - Get user's posts with pagination

### Posts
- `POST /api/posts` - Create a new post (requires authentication)

### Query Parameters
- `limit` - Number of posts to return (default: 10)
- `offset` - Number of posts to skip (default: 0)

## Database Schema

### Profiles Table
- `id` - UUID (references auth.users)
- `handle` - Unique username
- `name` - Display name
- `avatar_url` - Profile picture URL
- `bio` - User bio
- `created_at` - Timestamp

### Posts Table
- `id` - UUID
- `author_id` - UUID (references profiles)
- `text` - Post content (max 280 chars)
- `created_at` - Timestamp

## Architecture

- **Frontend**: Next.js App Router with TypeScript
- **API**: Next.js API routes with Supabase client
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Auth**: Supabase magic link authentication
- **Styling**: Tailwind CSS with responsive design

## Development Notes

- Posts are limited to 280 characters (enforced client and server-side)
- Pagination uses offset-based approach for simplicity
- Authentication uses JWT tokens passed in Authorization headers
- RLS policies ensure users can only modify their own content