# Ilhum

**An AI-powered creative writing and story development workspace.**

Ilhum is a creative workspace designed to help writers turn scattered inspirations into structured stories. By combining AI-assisted brainstorming, conversational story development, character generation, and visual story mapping, Ilhum helps writers explore ideas and develop narratives in one place.

## Features

- **Inspiration Collection** — Add text, URLs, and documents as creative inspiration for your stories.
- **AI Story Brainstorming** — Chat with an AI story architect to explore concepts, develop plots, and refine ideas using your collected inspirations.
- **Character Generation** — Generate character profiles, including backgrounds, personalities, character arcs, and relationships.
- **Visual Story Mapping** — Generate interactive flowcharts to visualize story progression, branching paths, and possible endings.
- **Interactive Flowcharts** — Explore and connect story nodes through a visual canvas.

## Tech Stack

- **Frontend:** React, TypeScript, Next.js
- **Visual Mapping:** React Flow / @xyflow/react
- **AI Integration:** OpenRouter API
- **Styling:** CSS, Tailwind CSS
- **Package Management:** npm

## Getting Started

### Prerequisites

- Node.js
- npm
- An OpenRouter API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ahadcs20-byte/Ilhum.git
   cd Ilhum
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the project root and add your API key:

   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |

## Project Structure

```text
ilhum/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── package.json
├── package-lock.json
├── tsconfig.json
└── next.config.ts
```

## Current Status

Ilhum is an ongoing personal project. Its current functionality focuses on collecting inspirations, AI-assisted story development, character generation, and visual story mapping.

## Future Plans

- Improve story organization and management.
- Expand story planning and character development tools.
- Improve the usability and functionality of the visual story map.
- Explore persistent story storage and project management.
- Develop new features as the project evolves.

## License

Currently, no license has been specified.
