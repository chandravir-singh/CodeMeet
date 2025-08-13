# CodeCompete - Coding Competition Platform

A modern web-based coding competition platform built with HTML, CSS, and JavaScript.

## Features

### 🎯 Coding Competition Features
- **Sample Questions Loading**: When users start a coding round, the platform automatically loads sample coding questions from the demo data
- **Full-Screen Mode**: Coding competitions require full-screen mode to prevent cheating
- **Exit/Fullscreen Options**: When users exit full-screen mode, they're presented with two options:
  - Return to Full-Screen: Continue the competition in full-screen mode
  - Exit Competition: Leave the competition and return to the event details

### 📝 Question Management
- **Multiple Questions**: Support for multiple coding questions per competition
- **Question Navigation**: Users can navigate between different questions using Previous/Next buttons
- **Demo Data Integration**: Questions are loaded from the demo-data.js file with fallback to hardcoded samples

### 🎨 User Interface
- **Modern Design**: Clean, responsive design with smooth animations
- **Modal Dialogs**: Professional modal dialogs for fullscreen options and other interactions
- **Question Navigation**: Intuitive navigation between questions with visual indicators

## How to Use

1. **Start a Coding Competition**:
   - Navigate to an event
   - Click "Start Coding" button
   - The platform will automatically load sample questions
   - Full-screen mode will be enabled

2. **Navigate Questions**:
   - Use the Previous/Next buttons to move between questions
   - Current question position is displayed (e.g., "Questions (1/3)")

3. **Full-Screen Management**:
   - If you exit full-screen mode, a modal will appear with options
   - Choose "Return to Full-Screen" to continue
   - Choose "Exit Competition" to leave the competition

## Technical Implementation

### Sample Questions Loading
- Questions are loaded from `demo-data.js` when available
- Fallback to hardcoded sample questions if demo data is not available
- Questions include title, description, difficulty, time limits, and test cases

### Full-Screen Options Modal
- Custom modal implementation with professional styling
- Two action buttons: Return to Full-Screen and Exit Competition
- Proper event handling for full-screen state changes

### Question Navigation System
- Dynamic question navigation with Previous/Next buttons
- Visual feedback for current question position
- Disabled states for navigation buttons at boundaries

## File Structure
```
├── index.html          # Main HTML file
├── app.js             # Main application logic
├── demo-data.js       # Sample data for questions and events
├── config.js          # Firebase configuration
└── styles.css         # CSS styles including modal and navigation
```

## Browser Compatibility
- Modern browsers with full-screen API support
- Responsive design for desktop and mobile devices
- Fallback handling for older browsers

## Development
To run the application locally:
1. Clone the repository
2. Open `index.html` in a web browser
3. Or serve using a local server: `python -m http.server 8000`

## Future Enhancements
- Real-time code execution
- Advanced test case validation
- User progress tracking
- Leaderboard integration
- Team collaboration features

