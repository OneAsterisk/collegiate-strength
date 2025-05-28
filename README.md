# Collegiate Strength - Powerlifting Leaderboard

**Collegiate Strength** is a competitive platform designed specifically for collegiate powerlifters to showcase their strength, track their progress, and compete with fellow lifters across universities nationwide.

## 🏋️ What is Collegiate Strength?

Collegiate Strength provides a centralized leaderboard where college powerlifters can submit their best lifts and see how they rank against other collegiate athletes. Whether you're hitting PRs in the gym or competing at meets, you can keep your numbers current and see where you stand in the collegiate powerlifting community.

## ✨ Key Features

### 🏆 **Global & University Leaderboards**

- **Global Rankings**: See how you stack up against all collegiate powerlifters
- **University-Specific Leaderboards**: Compare your lifts with athletes from your school
- **Real-time Updates**: Rankings update automatically as new lifts are submitted

### 📊 **Comprehensive Lift Tracking**

- **Submit Both Gym & Competition Lifts**: Track your best numbers whether from training or meets
- **DOTS Score Calculation**: Age-adjusted scoring system for fair comparison across weight classes
- **Personal Progress Tracking**: View your lift history and progress over time with interactive graphs

### 🎯 **Smart Ranking System**

- **Automatic Ranking**: Your highest total determines your leaderboard position
- **Multiple Sorting Options**: Sort by DOTS score, total, individual lifts, or other metrics
- **Weight Unit Flexibility**: View and submit lifts in either pounds or kilograms

### 👤 **User Profiles & Social Features**

- **Personal Profiles**: Dedicated pages showing individual lift history and stats
- **University Connections**: Connect with other lifters from your school
- **Real Names & Display Names**: Option to show both your real name and preferred display name

### 🔐 **Secure & User-Friendly**

- **Google Authentication**: Simple, secure sign-in process
- **Data Validation**: Built-in checks to ensure lift authenticity
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🎯 Who Is This For?

- **Collegiate Powerlifters** looking to track and compare their strength
- **University Powerlifting Teams** wanting to see how their members rank
- **Coaches** monitoring their athletes' progress
- **Anyone** interested in collegiate-level powerlifting performance data

## 🏅 How It Works

1. **Sign In**: Use your Google account to create a profile
2. **Submit Lifts**: Enter your best squat, bench press, and deadlift numbers
3. **Get Ranked**: Your highest total automatically places you on the leaderboard
4. **Track Progress**: View your lift history and see improvements over time
5. **Compare**: See how you rank globally and within your university

## 🏫 University Integration

The platform recognizes hundreds of universities and allows you to:

- Represent your school on university-specific leaderboards
- See how your university ranks against others
- Connect with fellow lifters from your institution

## 📈 Performance Metrics

- **DOTS Score**: Age and gender-adjusted scoring for fair comparison
- **Total**: Combined squat, bench press, and deadlift
- **Individual Lift Rankings (WIP)**: See where you rank in each specific lift

---

## 🛠️ Technical Setup

### Prerequisites

- Node.js (v18 or higher)
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd powerlifting-leaderboard
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Copy the example file and fill in your Firebase configuration
cp .env.example .env
```

4. Configure Firebase:

   - Create a Firebase project
   - Enable Authentication (Google provider)
   - Enable Firestore Database
   - Get your configuration values and add them to `.env`

5. Set up Firebase Admin (for admin operations):
   - Download your service account key from Firebase Console
   - Save it as `scripts/serviceAccountKey.json`
   - **Never commit this file to version control**

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building

To create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```
