# GitLab CI Bulk Onboarding

A React TypeScript frontend for GitLab workflow management that integrates with the GitLab App Service API. This application allows users to authenticate with GitLab, browse their groups and repositories, and submit CI/CD workflows to multiple repositories at once.

## Features

- **GitLab OAuth Authentication** - Secure login with GitLab credentials
- **Group Management** - Browse and select from your GitLab admin groups
- **Repository Selection** - Multi-select repositories within a group
- **Workflow Editor** - Built-in YAML editor with syntax validation
- **Bulk Submission** - Submit workflows to multiple repositories simultaneously
- **Real-time Status** - Track workflow submission progress and status
- **Responsive Design** - Mobile-friendly interface with modern UI

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- GitLab account with appropriate permissions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gitlab-app-ui
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Header with user info & logout
│   ├── LoadingSpinner.tsx  # Loading spinner component
│   └── ProtectedRoute.tsx  # Authentication guard
├── pages/              # Page components
│   ├── LoginPage.tsx   # OAuth login page
│   ├── CallbackPage.tsx    # OAuth callback handler
│   ├── GroupsPage.tsx  # Groups listing
│   ├── RepositoriesPage.tsx    # Repository selection
│   ├── WorkflowPage.tsx    # Workflow submission
│   └── StatusPage.tsx  # Submission status
├── services/           # API integration
│   └── api.ts         # API client with auth headers
├── hooks/             # Custom React hooks
│   └── useAuth.ts     # Authentication state management
├── utils/             # Utility functions
│   ├── auth.ts        # JWT token management
│   └── constants.ts   # API endpoints & configuration
├── App.tsx            # Main app component with routing
└── main.tsx          # Application entry point
```

## User Flow

1. **Login** (`/`) - GitLab OAuth authentication
2. **Groups** (`/groups`) - Display user's admin groups  
3. **Repositories** (`/repositories`) - Show repositories in selected group
4. **Workflow** (`/workflow`) - Submit `.gitlab-ci.yml` with custom content
5. **Status** (`/status/:id`) - Show submission status with real-time updates

## API Integration

The frontend integrates with a backend API service that provides:

- **Authentication**: GitLab OAuth flow handling
- **Groups**: Fetch user's GitLab groups with admin access
- **Repositories**: Get repositories within a group
- **Workflow Validation**: YAML syntax validation
- **Workflow Submission**: Submit workflows to multiple repositories
- **Status Tracking**: Real-time submission progress

### API Endpoints

- `GET /api/auth/login` - Initiate GitLab OAuth flow
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/user` - Get current user information
- `GET /api/groups` - Fetch user's admin groups
- `GET /api/repositories` - Get repositories in a group
- `POST /api/workflow/validate` - Validate workflow YAML
- `POST /api/workflow/submit` - Submit workflow to repositories
- `GET /api/workflow/status/:id` - Get submission status

## Configuration

### Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000/api`)

### GitLab OAuth Setup

For the OAuth flow to work properly, configure your GitLab application with:

- **Redirect URI**: `http://localhost:5173/callback` (for development)
- **Scopes**: `read_user`, `read_repository`, `write_repository`

## Authentication Flow

1. User clicks "Login with GitLab"
2. Redirects to GitLab OAuth authorization
3. GitLab redirects back to frontend `/callback`
4. Frontend exchanges authorization code for JWT token
5. Token stored in localStorage for API requests
6. Protected routes check authentication status

## Security Features

- JWT token-based authentication
- Automatic token expiration handling
- Protected routes with authentication guards
- Secure API communication with auth headers
- OAuth scope-limited access to GitLab resources

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type check
npx tsc --noEmit
```

## Browser Support

- Chrome/Chromium 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation for backend integration details