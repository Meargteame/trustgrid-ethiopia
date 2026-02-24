# TrustGrid Ethiopia

TrustGrid is a comprehensive testimonial collection and verification platform designed to build trust for businesses in Ethiopia. It allows businesses to collect text and video testimonials, verify them using AI (Gemini), and embed themeable widgets on their websites.

## Features

### 1. Identity & Branding
- **Custom Profiles:** Businesses can set up profiles with logos, brand colors, and slogans.
- **Form Builder:** Create and customize testimonial collection forms.

### 2. Collection System
- **Public Collection Page:** A dedicated, shareable link (`/collect/:username`) for customers to leave reviews.
- **Video Support:** Customers can record or upload video testimonials directly.
- **Star Ratings:** Standard 5-star rating system.

### 3. Trust & Verification (AI Powered)
- **AI Analysis:** Uses Google Gemini 1.5 Flash to analyze testimonials for:
  - **Sentiment:** Positive/Negative/Neutral.
  - **Trust Score:** (0-100) based on content authenticity.
  - **Spam Detection:** Automatically flags potential spam.
  - **Key Topics:** Extracts main themes from the review.
- **Verification Dashboard:** Review, approve, or reject testimonials before they go live.

### 4. Sharing & Embeds
- **Public Wall:** A showcase page (`/embed/:username`) displaying all approved testimonials.
- **Embed Widgets:**
  - **Wall Embed:** Embed the full wall on your site.
  - **Card Embed:** Embed single testimonials (`/embed/card/:id`) as lightweight cards.
- **Responsive Design:** Widgets adapt to mobile and desktop screens.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Supabase Account
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd trustgrid-ethiopia
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

### Database Setup (Supabase)

Run the SQL scripts in the Supabase SQL Editor in the following order to set up your database schema:

1. `supabase_schema.sql` (Base tables)
2. `update_profiles.sql` (Profile extensions)
3. `update_policies.sql` (RLS policies)
4. `update_form_schema.sql` (Form builder)
5. `update_verification.sql` (Verification status)
6. `update_testimonials_schema.sql` (AI fields)
7. `update_analytics_schema.sql` (Analytics tables)
8. `update_profiles_branding.sql` (Branding options)
9. `setup_storage.sql` (Storage buckets)

Alternatively, you can run `fix_database.sql` generally handles the core fixes if the base schema is applied.

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Deployment

To deploy to production (e.g., Vercel, Netlify):

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder.**

3. **Configure Rewrite Rules** (for Single Page App routing):
   Ensure all requests are rewritten to `index.html`.

   *Vercel (`vercel.json`):*
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

   *Netlify (`_redirects`):*
   ```
   /*  /index.html  200
   ```

