# ThinkFix – Turning Mistakes into Learning Opportunities

**ThinkFix** is an adaptive mathematics learning platform designed to help students understand their mistakes instead of simply showing them the correct answers.

It focuses on identifying the misconceptions behind students' incorrect answers and providing targeted learning support to help them improve.

## 🎯 Problem Statement

Students often make mistakes while solving mathematics problems. However, traditional learning systems mainly focus on whether an answer is right or wrong.

They do not always identify *why* a student made that mistake.

As a result, students may repeat the same mistakes without understanding the underlying concept.

## 💡 Our Solution

ThinkFix aims to identify the misconceptions behind students' answers and guide them towards understanding the correct concepts.

Instead of treating every wrong answer in the same way, ThinkFix focuses on the specific learning gap and provides relevant practice and guidance.

## ✨ Key Features

### 1. Student Dashboard
- Provides access to learning and practice activities.
- Displays student learning progress.
- Helps students continue their learning journey.

### 2. Misconception Identification
ThinkFix focuses on five common fraction misconceptions:

| ID | Misconception |
|---|---|
| M1 | Adding numerators and denominators directly |
| M2 | Incorrect use of common denominators |
| M3 | Believing that a bigger denominator always means a bigger fraction |
| M4 | Forgetting to take the reciprocal when dividing fractions |
| M5 | Confusion between mixed fractions and improper fractions |

### 3. Learn
Provides concept-focused learning material to help students understand the topics they find difficult.

### 4. Fix Buddy
Offers guidance and hints to help students understand their mistakes and work towards the correct solution.

### 5. Assessment and Practice
Students can answer questions and practise concepts to improve their understanding.

### 6. Learning Progress
ThinkFix uses performance levels to guide the next learning step:

- **0–39%:** Re-learn
- **40–75%:** Practise
- **76–100%:** Challenge

### 7. Teacher Dashboard
Helps teachers view student performance and identify topics where students may need additional support.

### 8. Multilingual Support
The platform includes language options for:
- English
- Telugu
- Hindi

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| JavaScript | Application logic |
| Vite | Development and build tool |
| Firebase | Backend services and data management |

## 🏗️ Project Architecture

ThinkFix follows a frontend-and-backend application structure.

- **Student Interface:** Learning, practice, assessments and progress.
- **Teacher Interface:** Student performance and learning insights.
- **Application Logic:** Question handling, misconception identification and learning progression.
- **Firebase:** Backend services and data storage.

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js
- npm
- Git

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd ThinkFix
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Firebase

Set up the Firebase configuration required by the project. Add the required configuration values locally according to the project's setup.

**Important:** Do not upload private credentials, API keys or `.env` files containing secrets to GitHub.

### 5. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal to access ThinkFix.

## 🎓 Target Users

- Students learning mathematics.
- Teachers monitoring student understanding.
- Educational institutions interested in misconception-based learning.

## 🌱 Future Scope

- Expand learning content to additional mathematics topics and classes.
- Improve adaptive question selection.
- Enhance learning analytics for teachers.
- Explore offline learning support.
- Expand multilingual learning support.

## 🏆 Project Information

**Project Name:** ThinkFix  
**Event:** Code Kernel '26 – Round 2  
**Supporting Partner:** MyStartupWave  
**Domain:** EdTech – Adaptive Learning

## 📌 Our Vision

We believe that every mistake is an opportunity to learn.

ThinkFix aims to make mathematics learning more meaningful by helping students understand not just what went wrong, but why it went wrong.

**ThinkFix – Understand the Mistake. Fix the Concept. Improve Your Learning.**