# Vedyx Leap Documentation

## Project Overview
Vedyx Leap is an adaptive learning platform specifically designed for neurodivergent learners, focusing on reading skills and story comprehension. The application features dynamic content adaptation based on user state, accessibility-first design, and personalized learning paths.

**Tech Stack:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Firebase/Firestore for data persistence
- Radix UI for accessible components
- Wouter for routing

## Directory Structure
src/
├── components/          # Reusable UI components with accessibility features
│   ├── ui/             # Base UI components (Button, Card, Input, etc.)
│   └── EnhancedCalmCorner/  # Sensory regulation features
├── data/               # Static content and templates
│   ├── story-templates/  # Story generation templates
│   └── words/          # Word banks and phonics data
├── lib/                # Core utilities and Firebase setup
├── pages/              # Route-level components
├── services/           # Business logic and API interactions
├── stores/             # Zustand state management
├── styles/             # Global styles and Tailwind customizations
└── types/              # TypeScript type definitions


## Component Documentation

### Core Components
- <mcsymbol name="App" filename="App.tsx" path="src/App.tsx" type="function">Root component handling routing, accessibility modes, and global state</mcsymbol>
- <mcsymbol name="ComplexitySwitch" filename="ComplexitySwitch.tsx" path="src/components/ComplexitySwitch.tsx" type="function">Controls content difficulty levels (simple, full, challenge)</mcsymbol>

### Page Components
- <mcsymbol name="TodayIWantToPage" filename="TodayIWantToPage.tsx" path="src/pages/TodayIWantToPage.tsx" type="function">Entry point for activity selection</mcsymbol>
- <mcsymbol name="StoryPage" filename="StoryPage.tsx" path="src/pages/StoryPage.tsx" type="function">Displays adaptive stories with complexity controls</mcsymbol>
- <mcsymbol name="StoryGenerationPage" filename="StoryGenerationPage.tsx" path="src/pages/StoryGenerationPage.tsx" type="function">Generates personalized stories based on user state</mcsymbol>
- <mcsymbol name="PracticeReadingPage" filename="PracticeReadingPage.tsx" path="src/pages/PracticeReadingPage.tsx" type="function">Reading activities hub with mood-based recommendations</mcsymbol>

### UI Components
- <mcsymbol name="Card" filename="Card.tsx" path="src/components/ui/Card.tsx" type="function">Accessible card component with neurodivergent-friendly variants</mcsymbol>
- <mcsymbol name="Input" filename="Input.tsx" path="src/components/ui/Input.tsx" type="function">Form inputs with motor accessibility features</mcsymbol>
- <mcsymbol name="Modal" filename="Modal.tsx" path="src/components/ui/Modal.tsx" type="function">Dialog component with sensory-friendly overlays</mcsymbol>

## Data Layer

### Firebase Integration
- <mcfile name="firebase-config.ts" path="src/config/firebase.ts">Firebase initialization and configuration</mcfile>
- Data collections:
  - `words`: Phonics and vocabulary database
  - Stories: Dynamic story templates and generated content
  - User preferences and progress tracking

### Data Structures
1. Word Bank:
   - Structured vocabulary with phonics patterns
   - Difficulty levels and theme categorization
   - ND-specific learning supports

2. Story Templates:
   - Multi-complexity versions
   - Phonics integration points
   - Adaptive difficulty scaling

## Application Flow

1. **Initialization**
   - App boots from <mcfile name="main.tsx" path="src/main.tsx">main.tsx</mcfile>
   - Loads accessibility preferences and user state
   - Initializes Firebase connection

2. **User Journey**
   - Starts at TodayIWantToPage for activity selection
   - Routes to specific learning activities
   - Dynamic content adaptation based on brain state
   - Progress tracking and difficulty adjustment

## For Contributors

### Development Guidelines
1. **Component Structure**
   - Place new components in `src/components/[feature]/`
   - Use TypeScript for all new code
   - Follow existing accessibility patterns

2. **Styling**
   - Use TailwindCSS with custom ND-friendly variables
   - Follow existing color scheme for cognitive load management
   - Maintain motor-friendly touch targets

3. **State Management**
   - Use Zustand for global state
   - Local state for component-specific concerns
   - Persist user preferences in localStorage

4. **Accessibility**
   - Support keyboard navigation
   - Maintain ARIA attributes
   - Test with screen readers
   - Consider motor planning in interactions

5. **Code Organization**
   - PascalCase for components
   - camelCase for utilities
   - Group related features in feature folders
   - Keep components focused and single-purpose

### Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Firebase credentials
4. Start development: `npm run dev`

---
Last Updated: [Current Date]