# Signlang-AI

**AI-Powered Sign Language Learning and Interaction Platform**

Signlang-AI is an end-to-end educational platform designed to bridge the communication gap for learners with hearing and speech impairments. By leveraging advanced Artificial Intelligence, Computer Vision, and NLP, this project transforms traditional educational content into accessible sign language videos and enables two-way interactive communication.

---

## 🚀 Key Features

### 1. Content-to-Sign Language Teaching (Module 1)
*   **Automated Conversion**: Instantly converts PDF, DOCX, and PPT learning materials into sign language lessons.
*   **AI Avatar Teacher**: Uses a realistic 3D avatar to teach lessons with accurate sign gestures and facial expressions.
*   **Smart Summarization**: Simplifies complex text into pedagogical content suitable for sign language grammar.

### 2. Sign Language Query & Response (Module 2)
*   **Two-Way Communication**: Users can sign questions via webcam.
*   **Real-Time Interpretation**: The AI interprets user signs into text/speech.
*   **Interactive Answers**: Responses are generated and signed back by the AI avatar.

---

## 📚 Project Proposal
For a detailed breakdown of the problem statement, system architecture, deep learning models, and research contributions, please read the full **[Project Synopsis](synopsis.md)**.

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite), Tailwind CSS
*   **AI/ML**: Google Gemini API (for text/sign interpretation), MediaPipe (planned), TensorFlow/PyTorch (planned)
*   **Backend**: Node.js (current), Python FastAPI (planned for advanced ML pipelines)

---

## ⚡ Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/amritesh-0/Signlang-AI.git
    cd Signlang-AI
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 👥 Authors
*   **Amritesh Pandey** - *Initial Work*

---
*Created for a Final Year Deep Learning Project.*
