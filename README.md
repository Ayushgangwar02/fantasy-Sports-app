# 🏆 Fantasy Sports Manager

A comprehensive Fantasy Sports application built with React, TypeScript, and Vite. Manage your fantasy teams, track player statistics, and compete in leagues with an intuitive and modern interface.

![Fantasy Sports Manager](https://img.shields.io/badge/React-18.x-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Vite](https://img.shields.io/badge/Vite-7.x-purple)

## ✨ Features

### 🏠 Dashboard
- **Team Overview**: View all your fantasy teams at a glance
- **Recent Activity**: Track your latest trades, adds, and drops
- **Upcoming Matchups**: See your next games and opponents
- **Quick Stats**: Monitor your performance metrics

### 👥 Player Management
- **Player Search**: Find players by name or team
- **Advanced Filtering**: Filter by sport, position, and availability
- **Player Statistics**: View detailed stats and performance data
- **Add to Team**: Easily add available players to your roster

### ⚡ Team Management
- **Multiple Teams**: Manage teams across different sports
- **Lineup Management**: Set your starting lineup and bench players
- **Budget Tracking**: Monitor your salary cap with visual indicators
- **Roster Operations**: Add, drop, and trade players

### 🏆 League Standings
- **Real-time Rankings**: See where you stand in your leagues
- **Matchup Schedule**: View upcoming games and opponents
- **League Statistics**: Track league-wide performance metrics
- **Points Tracking**: Monitor points for and against

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ayushgangwar02/fantasy-Sports-app.git
   cd fantasy-Sports-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Modern CSS with Flexbox and Grid
- **State Management**: React Hooks (useState)
- **Development**: Hot Module Replacement (HMR)

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- 🖥️ Desktop computers
- 📱 Mobile phones
- 📟 Tablets

## 🎨 UI/UX Features

- **Modern Design**: Glass-morphism effects and gradient backgrounds
- **Smooth Animations**: Hover effects and transitions
- **Intuitive Navigation**: Tab-based navigation system
- **Visual Feedback**: Status badges and progress indicators
- **Accessibility**: Focus states and keyboard navigation

## 📊 Sports Supported

Currently supports:
- 🏈 **Football** (NFL)
- 🏀 **Basketball** (NBA)

*More sports coming soon!*

## 🔧 Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── PlayerManagement.tsx   # Player search and management
│   ├── TeamManagement.tsx     # Team and lineup management
│   └── LeagueStandings.tsx    # League rankings and stats
├── App.tsx                    # Main application component
├── App.css                    # Application styles
├── index.css                  # Global styles
└── main.tsx                   # Application entry point
```

## 🚀 Deployment

The application can be deployed to various platforms:

- **Vercel**: `npm run build` then deploy the `dist/` folder
- **Netlify**: Connect your GitHub repository for automatic deployments
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the lightning-fast build tool
- Fantasy sports community for inspiration

---

**Built with ❤️ for fantasy sports enthusiasts**
