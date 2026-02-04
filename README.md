# Confidence Tracker - AnnieCannons

A React application for students to track their coding skill confidence levels over time.

## Features

- Track multiple coding skills
- Log confidence scores from 1-10 with detailed descriptions
- Set practice goals and time commitments
- Visual progress tracking with line charts
- Celebration animations when goals are achieved
- Persistent data storage

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation

1. Extract the zip file to your desired location

2. Open the project folder in VS Code or your terminal

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

### First Time Use

1. Click "Track a New Skill" to add a skill (e.g., "React Components", "SQL Queries")
2. Click "Log New Score" to set your initial confidence level
3. Use the slider to rate your confidence (1-10)
4. Set your practice time goal and confidence point goal
5. Click "Log Score" to save

### Subsequent Check-ins

1. Click "Log New Score" on any skill card
2. Answer if you met your practice time goal (shown on second check-in only)
3. Rate your current confidence level
4. Your progress will be tracked and displayed on the chart

### When You Meet Your Goal

When your confidence score reaches or exceeds your goal:
- 🎉 Confetti animation appears
- Option to set a new goal point target
- Continue tracking your growth!

## Project Structure

```
confidence-tracker-app/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles and Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md           # This file
```

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Recharts** - Chart visualization
- **Lucide React** - Icons
- **localStorage** - Data persistence

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Clear Data

To reset all data during testing, use the browser's developer tools:
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Clear localStorage for the site

Or click the "Clear All Data" button in the app (if enabled in testing mode).

## Integration with Student Portal

This standalone app can be integrated into your existing student portal by:

1. Building the production version: `npm run build`
2. The build creates static files in the `dist` folder
3. These can be:
   - Hosted as a separate subdomain
   - Integrated as a route in your existing portal
   - Embedded as an iframe

For full integration, you'll want to:
- Replace localStorage with your backend API
- Add user authentication to link data to specific students
- Implement teacher dashboards to view student progress

## AnnieCannons Branding

The app uses AnnieCannons brand colors:
- Primary: Teal (#1AA5A5)
- Accent: Dark Gray (#3D3D3D)

## Support

For issues or questions, contact the development team.

---

Built with ❤️ for AnnieCannons
