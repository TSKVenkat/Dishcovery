# Dishcovery - Your Personal Cooking Assistant

Dishcovery is a modern web application designed to help users discover, manage, and create delicious recipes while maintaining a healthy lifestyle. The application provides personalized recipe suggestions based on dietary preferences, fitness goals, and available ingredients.

## Features

- **Personalized Recipe Discovery**: Get recipe suggestions based on your dietary preferences and fitness goals
- **Inventory Management**: Track your kitchen inventory and get recipe suggestions based on available ingredients
- **Dietary Preferences**: Customize your experience based on specific dietary needs and restrictions
- **Community Forum**: Share and discuss recipes with other users
- **User Profiles**: Track your cooking journey and achievements
- **Responsive Design**: Access the application seamlessly across all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dishcovery.git
cd dishcovery
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dishcovery/
├── app/                    # Next.js app directory
│   ├── protected/         # Protected routes
│   ├── (auth)/           # Authentication routes
│   └── layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── header-auth.tsx   # Authentication header
├── utils/                # Utility functions
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## This project was made as a submission  for  GDG Solutions Challenge 2025 


