# SAPRO Dashboard 1.0 - Smart Greenhouse Monitoring & Management System

A comprehensive full-stack web application for monitoring and managing greenhouse operations. Built with React, Firebase, and modern web technologies.

## 🌟 Features

### Core Modules

- **Dashboard Overview** - Real-time monitoring with environmental data visualization
- **Environmental Monitoring** - Temperature, humidity, and soil moisture tracking
- **Watering Management** - Schedule and manage irrigation systems
- **Planting Schedules** - Track crop planting and harvesting cycles
- **Data Analytics & Reports** - Generate comprehensive performance reports
- **Simulation Panel** - Test system with simulated sensor data
- **Settings & Configuration** - Customize alerts and system preferences
- **Admin Panel** - User management and system administration

### Key Features

- 🔐 **Authentication & Authorization** - Firebase Auth with role-based access
- 📊 **Real-time Data Visualization** - Interactive charts and graphs
- 🔔 **Smart Alerts** - Configurable threshold-based notifications
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🌙 **Dark/Light Theme** - User preference support
- 📈 **Data Export** - CSV export for reports and analytics
- 🎯 **Simulation Mode** - Test without physical hardware

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project (for production)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sapro-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication and Firestore Database
   - Copy your Firebase config to `src/firebase/firebaseConfig.js`

   **Option 1: Direct Configuration**

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
   };
   ```

   **Option 2: Environment Variables (Recommended)**

   Create a `.env` file in the root directory:

   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

   The application will automatically use environment variables if available, or fall back to demo values for testing.

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js       # Top navigation bar
│   ├── Sidebar.js      # Side navigation menu
│   ├── DashboardCards.js # Dashboard overview cards
│   ├── Charts.js       # Chart components
│   ├── AlertsPanel.js  # Alert notifications
│   └── CalendarView.js # Calendar component
├── pages/              # Main application pages
│   ├── Login.js        # Authentication page
│   ├── Dashboard.js    # Main dashboard
│   ├── Monitoring.js   # Environmental monitoring
│   ├── Watering.js     # Watering management
│   ├── Planting.js     # Planting schedules
│   ├── Reports.js      # Analytics and reports
│   ├── Simulation.js   # Data simulation
│   ├── Settings.js     # User settings
│   └── Admin.js        # Admin panel
├── firebase/           # Firebase configuration
│   ├── firebaseConfig.js # Firebase setup
│   ├── auth.js        # Authentication functions
│   └── firestore.js   # Database operations
├── utils/              # Utility functions
│   ├── dataGenerator.js # Data simulation
│   ├── alertLogic.js  # Alert processing
│   └── reportUtils.js  # Report generation
├── context/            # React context providers
│   ├── AuthContext.js  # Authentication context
│   └── ThemeContext.js # Theme management
└── App.js              # Main application component
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication**

   - Enable Email/Password authentication
   - Configure user roles in Firestore

2. **Firestore Database**

   - Create collections: `users`, `environmentData`, `wateringSchedules`, `plantingSchedules`, `alerts`, `settings`, `activityLogs`
   - Set up security rules for role-based access

3. **Security Rules Example**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 📊 Data Structure

### Firestore Collections

#### Users

```javascript
{
  userId: "string",
  name: "string",
  email: "string",
  role: "admin" | "staff",
  createdAt: "timestamp"
}
```

#### Environment Data

```javascript
{
  temperature: "number",
  humidity: "number",
  soilMoisture: "number",
  timestamp: "timestamp"
}
```

#### Watering Schedules

```javascript
{
  zone: "string",
  time: "timestamp",
  duration: "string",
  status: "pending" | "completed" | "cancelled"
}
```

#### Planting Schedules

```javascript
{
  crop: "string",
  plantedDate: "date",
  harvestDate: "date",
  status: "seeded" | "growing" | "harvested",
  zone: "string",
  quantity: "number"
}
```

## 🎨 Customization

### Themes

The application supports light and dark themes. Users can toggle between themes in the settings panel.

### Styling

- Built with Tailwind CSS
- Custom color scheme for greenhouse monitoring
- Responsive design for all screen sizes
- Dark mode support

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.js`
4. Add navigation items in `src/components/Sidebar.js`

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Other Platforms

- **Vercel**: Connect your GitHub repository
- **Netlify**: Deploy from build folder
- **AWS S3**: Upload build folder to S3 bucket

## 🧪 Testing

### Simulation Mode

The application includes a simulation mode for testing without physical hardware:

- Navigate to the Simulation page
- Configure sensor ranges
- Start/stop data generation
- Monitor alerts and notifications

### Test Data

The application includes sample data generators for:

- Environmental sensor readings
- Watering schedules
- Planting schedules
- User activity logs

## 📱 Mobile Support

The application is fully responsive and works on:

- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) capabilities

## 🔒 Security

- Firebase Authentication for user management
- Role-based access control (Admin/Staff)
- Secure Firestore rules
- Input validation and sanitization
- HTTPS enforcement in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Updates

### Version 1.0 Features

- ✅ Complete dashboard system
- ✅ Real-time monitoring
- ✅ User management
- ✅ Data visualization
- ✅ Simulation mode
- ✅ Responsive design
- ✅ Dark/light themes

### Future Enhancements

- 📱 Mobile app (React Native)
- 🤖 IoT device integration
- 📊 Advanced analytics
- 🔔 Push notifications
- 📈 Machine learning predictions
- 🌐 Multi-language support

---

**SAPRO Dashboard 1.0** - Smart Greenhouse Monitoring & Management System
Built with ❤️ for modern agriculture
