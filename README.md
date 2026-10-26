# AI Interview Coach 🎯

An AI-powered interview practice platform that helps users prepare for interviews through personalized questions, answer evaluation, and performance tracking.

## 📌 Project Overview

AI Interview Coach is a web application designed to help students and job seekers improve their interview skills. Users can practice mock interviews, receive AI-generated feedback on their answers, and review their performance over time.

The application uses a React frontend, a Node.js and Express backend, PostgreSQL for data storage, and Google's Gemini API for AI-powered features.

## ✨ Features

* **User Authentication:** Create an account and log in securely.
* **AI-Generated Interview Questions:** Generate interview questions using AI.
* **Resume Upload:** Upload a resume to support interview preparation.
* **Mock Interview Practice:** Answer interview questions through the application.
* **AI-Powered Feedback:** Receive feedback and scores for interview answers.
* **Performance Dashboard:** Review interview performance and score summaries.
* **Interview History:** Access previous interviews and their feedback.
* **Progress Tracking:** Compare interview scores over multiple practice sessions.
* **Voice Input:** Use the application's voice recording feature where supported.

## 🛠️ Technologies Used

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL
* Prisma ORM

### Artificial Intelligence

* Google Gemini API

### Development Tools

* Visual Studio Code
* Git and GitHub
* Docker

## 🏗️ Project Structure

```text
ai-interview-coach/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── migrations/
│   ├── prisma/
│   ├── scripts/
│   ├── src/
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

## ⚙️ Prerequisites

Before running the application, install:

* Node.js and npm
* Docker Desktop
* Git
* A Google Gemini API key

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/somashekargouda111/ai-interview-coach.git
cd ai-interview-coach
```

### 2. Start PostgreSQL

From the project root, run:

```bash
docker compose up -d
```

Ensure Docker Desktop is running before executing this command.

### 3. Configure Environment Variables

Create the required environment files using the example files provided in the repository.

Configure the backend environment variables according to `server/.env.example` and the frontend variables according to `client/.env.example`.

Add your own Gemini API key and database connection details to the appropriate local environment files.

**Important:** Never commit actual API keys, passwords, or `.env` files to GitHub.

### 4. Install Backend Dependencies

Open a terminal in the project root and run:

```bash
cd server
npm install
```

Configure the required backend environment variables before starting the server.

### 5. Start the Backend

From the `server` directory, run:

```bash
npm run dev
```

The backend is expected to run at `http://localhost:4000` when configured with the default development settings.

### 6. Install Frontend Dependencies

Open another terminal from the project root and run:

```bash
cd client
npm install
```

Configure the frontend environment variables required to connect to the backend.

### 7. Start the Frontend

From the `client` directory, run:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically `http://localhost:5173`.

## 🔄 Application Workflow

1. Register or log in to the application.
2. Upload your resume if required for your interview setup.
3. Start an interview practice session.
4. Answer the generated interview questions.
5. Review AI-generated feedback and scores.
6. Visit the dashboard and interview history to review previous results.

## 🔐 Security

* Keep API keys and database credentials in environment variables.
* Do not commit actual `.env` files.
* Use secure authentication practices.
* Avoid uploading private resumes or other personal information to the public repository.

## 🔮 Future Enhancements

Potential improvements include:

* Additional interview categories and difficulty levels.
* More detailed progress analytics.
* Expanded interview preparation resources.
* Deployment to a publicly accessible hosting platform.
* Improved accessibility and user experience.

## 👨‍💻 Author

**Somashekargouda**

GitHub: [somashekargouda111](https://github.com/somashekargouda111)

## 📄 License

No license has been specified yet. Add a license if you decide to publish the project under particular reuse terms.
