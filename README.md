# KAVACH AI: Advanced Fraud Detection & Intelligence Platform

KAVACH AI is a comprehensive, AI-powered platform designed to protect citizens from scams and empower law enforcement investigators with actionable fraud intelligence. It leverages real-time threat analysis, complex fraud-network graphing, and geospatial tracking to stay ahead of sophisticated criminal operations.

The platform consists of a **FastAPI Python Backend**, a **React Web Dashboard**, and a **React Native Mobile Application**.

## 🌟 Key Features

### Citizen Shield
- **Threat Analysis:** Citizens can upload suspicious texts, audio, or files for instant AI-based risk scoring.
- **Counterfeit Currency Scanner (FICN):** AI-powered computer vision tool to instantly detect fake Indian banknotes by analyzing microprints and security threads.
- **AI Chat Assistant (12 Regional Languages):** A smart conversational assistant that guides citizens on how to report scams and protect their personal information, natively supporting 12 Indian regional languages.
- **Omnichannel WhatsApp & IVR Support:** Designed with an architecture that allows citizens to report incidents via standard WhatsApp messages and IVR toll-free numbers without needing an app.
- **Reporting History:** Citizens can track the status of their reports and see investigator feedback.

### Investigator Command Centre
- **Fraud Network Explorer:** An interactive Cytoscape.js graph that visualizes connections between scam cases, phone numbers, crypto wallets, and IP addresses to uncover organized fraud rings.
- **Digital Arrest Detection & Alerts:** AI automatically tags "Digital Arrest" scams, empowering investigators to instantly Auto-Generate MHA Alerts to freeze transfers.
- **Geospatial Intelligence Map:** A heat map highlighting scam hotspots to help prioritize regional enforcement.
- **Case Management & Evidence Export:** Tools for investigators to review citizen reports, update case statuses, and export clean, court-admissible Intelligence Packages (PDF) with a single click.
- **Real-Time Dashboards:** Key performance indicators and metrics tracking the volume and types of ongoing fraud.

## 🚀 Tech Stack & Architecture

### 🧠 Artificial Intelligence & Machine Learning (AI/ML)
- **Threat Detection ML Pipelines:** Real-time AI analysis of text, audio, and files for fraud risk scoring and intent classification.
- **AI Conversational Assistant:** LLM-powered assistant integrated directly into the citizen workflows for intelligent reporting guidance.
- **Pattern Recognition & Clustering:** Advanced machine learning algorithms applied to scam networks to identify and cluster criminal syndicates.

### 🐳 Infrastructure & CI/CD Pipelines
- **Containerization:** Fully containerized environment using **Docker**.
- **Orchestration:** `docker-compose` setup for local microservices orchestration.
- **Deployment Pipelines:** Configured for seamless CI/CD pipelines (e.g., GitHub Actions) to automate testing, builds, and production deployments.

### ⚙️ Backend (Python)
- **Framework:** Python 3.10+ with **FastAPI** for high-performance async APIs.
- **Database:** SQLite (aiosqlite) with SQLAlchemy ORM and Alembic for database migrations.
- **Testing:** Pytest

### 💻 Frontend (Web)
- **Framework:** React 19 + Vite + TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Data Fetching & State:** React Query + Zustand
- **Visualization:** React Leaflet (Maps), Cytoscape.js (Network Graphs), Recharts (Metrics)

### 📱 Mobile App (React Native)
- **Framework:** React Native + Expo + TypeScript
- **Navigation:** React Navigation (Native Stack & Bottom Tabs)
- **Styling:** Tailwind CSS (via NativeWind/custom classes)

## 🛠️ Getting Started (Local Development)

### Prerequisites
- **Node.js:** v18+
- **Python:** v3.10+
- **Git**

### 1. Backend Setup
The backend API needs to be running for the frontend and mobile apps to function correctly.
```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
The backend API will be available at `http://localhost:8000`.

### 2. Web Frontend Setup
```bash
# Navigate to the root project directory (if not already there)
cd ..

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```
The web app will be available at `http://localhost:5173`.

### 3. Mobile App Setup
```bash
# Navigate to the mobile app directory
cd mobile-app

# Install dependencies
npm install

# Start the Expo development server
npm start
```
You can run the app in an Android/iOS emulator or on a physical device using the Expo Go app.

## 🔑 Test Credentials

Use the following pre-seeded credentials to quickly test the application locally:

**Investigator Account (Access to Command Centre):**
- **Email:** `investigator@kavach.ai`
- **Password:** `admin123`

**Citizen Account (Access to KAVACH Shield):**
- **Email:** `citizen@example.com`
- **Password:** `password123`

## 📦 Building for Production

### Web
```bash
npm run build
```
This generates the optimized static files in the `dist/` directory.

### Android APK (Release Build)
To build a production-ready signed `.apk` file locally:
```bash
cd mobile-app
npx expo prebuild --platform android --clean
```
Ensure your `release.keystore` is placed in `android/app/` and configured in `build.gradle`, then run:
```bash
cd android
./gradlew assembleRelease
```
The generated APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

## 📜 License
This project is proprietary and built for demonstration and internal use.
