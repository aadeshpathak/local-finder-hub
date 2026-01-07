# Local Finder Hub

A modern web application for connecting users with trusted local service professionals. Find electricians, plumbers, tutors, mechanics, and more in your area.

## Features

- 🔍 Advanced search and filtering
- 🗺️ Interactive maps with service locations
- 💬 Real-time messaging between users and providers
- ⭐ Review and rating system
- 👤 User authentication and profiles
- 📱 Responsive design
- 🛠️ Admin dashboard with analytics
- ☁️ File uploads for resumes and profiles

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: ShadCN UI, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Maps**: Leaflet, LocationIQ API
- **Charts**: Recharts
- **File Storage**: Cloudinary

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd local-finder-hub
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── data/               # Static data
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---
