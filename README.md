# 🦁 Lynx Word Game 🎮

<div align="center">

**A real-time multiplayer word guessing game built with Angular**

[![Angular](https://img.shields.io/badge/Angular-19.2.8-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8.svg)](https://tailwindcss.com/)

</div>

---

## 📖 About

**Lynx** is an engaging word guessing game where players compete to identify words based on progressively revealed cue words. The game features both solo and multiplayer modes, with real-time voice chat capabilities for an immersive social gaming experience.

### 🎯 How It Works

Players try to guess the word common to the "cue" words appearing on the screen:
- **Round starts** with 2 cue words (20 seconds)
- If unsolved, a **3rd cue** appears (15 more seconds)
- Then a **4th cue** (10 seconds)
- Finally a **5th cue** (5 seconds)

The quicker the solution, the more points earned! Each game consists of 10 rounds, and players can track their cumulative session scores.

---

## ✨ Features

### 🎮 Game Modes
- **Solo Play** - Practice mode for individual players
- **Multiplayer** - Scheduled games with friends and other players

### 🎤 Real-Time Features
- **Voice Chat** - LiveKit-powered voice communication during multiplayer games
- **Real-Time Synchronization** - Colyseus-powered game state synchronization
- **Live Scoring** - Track scores in real-time across all players

### 👤 User Features
- **Authentication** - Secure login and registration system
- **User Profiles** - Track your game history and scores
- **Word Management** - Admin interface for managing game words (CRUD operations)
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices

### 🎨 UI/UX
- **Modern Design** - Built with Tailwind CSS and DaisyUI
- **Material Design** - Angular Material components for consistent UI
- **Accessibility** - Keyboard shortcuts and screen reader support
- **Audio Feedback** - Sound effects for game events

---

## 🛠️ Tech Stack

### Frontend Framework
- **Angular 19** - Modern web framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming

### State Management
- **NgRx Signals** - Reactive state management

### Real-Time Communication
- **Colyseus** - Multiplayer game server client
- **LiveKit** - Real-time voice communication
- **Socket.io** - WebSocket communication

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library for Tailwind
- **Angular Material** - Material Design components
- **SCSS** - Enhanced CSS with variables and mixins

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitizen** - Conventional commits
- **Karma & Jasmine** - Testing framework

### Utilities
- **date-fns** - Date manipulation
- **Font Awesome** - Icon library
- **ngx-device-detector** - Device detection

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm/yarn
- **Angular CLI** (v19 or higher)

---

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lynx-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**
   
   Create or update `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:4000/api',
     colyseusUrl: 'ws://localhost:4000/api',
     timeout: 10000,
     liveKitServerUrl: 'ws://localhost:7880',
   }
   ```

4. **Start the development server**
   ```bash
   pnpm start
   # or
   npm start
   ```

   The application will be available at `http://localhost:4200`

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Start development server on `0.0.0.0` (accessible from network) |
| `pnpm build` | Build for production |
| `pnpm watch` | Build and watch for changes |
| `pnpm test` | Run unit tests |
| `pnpm lint` | Lint and auto-fix code issues |
| `pnpm format` | Format code with Prettier |
| `pnpm cm` | Interactive commit using Commitizen |

---

## 🔧 Configuration

### Environment Files

- `environment.ts` - Base environment configuration
- `environment.development.ts` - Development overrides
- `environment.production.ts` - Production configuration

### Key Configuration Points

- **API URL** - Backend API endpoint
- **Colyseus URL** - WebSocket server for game state
- **LiveKit URL** - Voice chat server
- **Timeout** - HTTP request timeout duration

---

## 🎯 Key Features Implementation

### Authentication Flow
- JWT-based authentication
- Token refresh mechanism
- Protected routes with guards
- Optional authentication for public game access

### Game State Management
- Colyseus rooms for real-time game synchronization
- NgRx Signals for reactive UI updates
- Optimistic UI updates with error handling

### Voice Chat
- LiveKit integration for real-time audio
- Microphone permission handling
- Mute/unmute controls
- Participant tracking

### Word Management
- Infinite scroll pagination
- Search and filter functionality
- CRUD operations for game words
- Validation and error handling

---

## 📝 Code Quality

This project follows strict code quality standards:

- **ESLint** - Code linting with Angular-specific rules
- **Prettier** - Consistent code formatting
- **Husky** - Pre-commit hooks for quality checks
- **Commitizen** - Conventional commit messages
- **TypeScript** - Strict type checking

---

<div align="center">

**Happy Lynx Solving! 🎯**

</div>
