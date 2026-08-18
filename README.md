# StudySnap 📚✨ (v1.3.0)

StudySnap is a mobile-first, AI-powered study assistant designed to transform raw notes into structured learning materials. It leverages the **Gemini API** for advanced OCR, summarization, and research, while providing real-time collaborative features for students and educators.

## 🚀 Key Features

### 🧠 AI-Powered Learning
- **Smart OCR**: Convert photos of handwritten or printed notes into clean, structured digital content.
- **Auto Note Builder**: Automatically generate summaries, key takeaways, and exam-ready notes.
- **Flashcard & Quiz Engine**: Instantly create interactive flashcards and quizzes from your study materials.
- **AI Study Twin**: Predict potential mistakes and optimize your learning path based on your activity.
- **Doubt Solver**: Get instant, context-aware help from AI or top peers.

### 🌐 Real-Time Collaboration
- **Live Classroom**: Join real-time video/audio sessions with WebRTC and WebSockets. Features include host management, hand-raising, and synchronized chat.
- **Knowledge Battles**: Compete in high-stakes, 30-second rounds of pure skill against other students.
- **Group Study Rooms**: Collaborative spaces for focused group learning.

### 🔍 Advanced Research
- **AI Research Hub**: Perform deep-dives into any topic using Gemini grounded in **Google Search**.
- **Sources & Citations**: Every research session provides verified sources and further reading links.

### 🎨 Adaptive Experience
- **Age-Based UI**: The interface dynamically adapts its theme, typography, and features based on the user's age group (Baby, Kid, Teen, Adult).
- **Persona-Based Shortcuts**: Quick access to tools based on your learning style (Quizzer, Researcher, Competitor, Solver).

### 📈 Growth Tracking
- **Academic Timeline**: Track your milestones and progress over time.
- **Skill Passport**: A digital record of your academic achievements and skills.
- **Career Finder**: AI-driven career recommendations based on your learning profile.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, Framer Motion
- **Backend**: Node.js, Express, Socket.io (WebSockets)
- **Real-Time**: Simple-Peer (WebRTC)
- **Database**: SQLite (Firebase/Firestore)
- **AI**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React

## ⚙️ Setup & Configuration

### Environment Variables
The application requires the following environment variables:

- `GEMINI_API_KEY`: Your Google Gemini API key (configured via AI Studio Secrets).
- `APP_URL`: The base URL of the application (automatically injected in AI Studio).

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## 📱 Design Philosophy
StudySnap follows a **Technical Dashboard** and **Editorial** hybrid design recipe. It uses high-density data grids for analytics and massive, bold typography for hero sections to create a professional yet engaging educational environment.

---
## 👨‍💻 Creator

**Macdonald Barasa**
- **Email**: [simiyumacdonald1@gmail.com](mailto:simiyumacdonald1@gmail.com)
- **Contacts**: +254 748 322 641

*Built with ❤️ using Google AI Studio Build.*
