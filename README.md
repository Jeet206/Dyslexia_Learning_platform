Dyslexia-QnA-and-Lesson-Summery

An AI-powered learning assistant designed to support students with dyslexia by simplifying reading and comprehension.
This project includes tools to summarize lessons and generate Q&A questions automatically from any input text, making learning more engaging and accessible.

✨ Features

📖 Lesson Summarizer – Converts long lessons into short, simplified summaries.

❓ QnA Generator – Automatically creates comprehension questions (with answers) from lesson text.

🔊 Text-to-Speech Support (Optional) – Reads lessons and summaries aloud for easier understanding.

🧠 Adaptive Learning Design – Keeps content beginner-friendly and dyslexia-friendly.

🚀 Getting Started
1. Clone the repository
git clone https://github.com/Jeet206/Dyslexia-QnA-and-Lesson-Summery.git
cd Dyslexia-QnA-and-Lesson-Summery

2. Install dependencies
npm install

3. Run the development server
npm run dev


By default, the app runs at http://localhost:3000
.

4. Build for production
npm run build
npm start

🛠 Tech Stack

Next.js (React + Node.js framework)

Shadcn/UI + Tailwind CSS (UI components and styling)

OpenAI / HuggingFace models (for summarization & QnA generation)

Speech Recognition + Text-to-Speech APIs (optional accessibility features)

📂 Project Structure
├── data/
│   └── submissions.json     # Stores lesson/QnA submissions
├── pages/
│   ├── api/                 # API routes
│   ├── _app.js              # App wrapper
│   └── index.js             # Main entry point
├── public/
│   └── interactive.js       # Client-side interaction logic
├── styles/                  # Global styles
├── .env                     # Environment variables
├── next.config.js           # Next.js config
├── package.json             # Dependencies & scripts
└── README.md                # Project documentation

🌍 Use Case

Designed for students with dyslexia who struggle with long or complex reading material.

Can be extended for educational platforms, teachers, and e-learning apps.

Helps learners improve comprehension and recall through automated summaries and generated QnA.

🤝 Contributing

Contributions are welcome!

Fork the repo

Create your feature branch (git checkout -b feature/YourFeature)

Commit changes (git commit -m 'Add new feature')

Push to the branch (git push origin feature/YourFeature)

Open a Pull Request

📜 License

This project is licensed under the MIT License – free to use and modify.

💡 Roadmap

 Add speech-to-text for lesson input

 Improve question variety (MCQs, fill-in-the-blanks, true/false)

 Add user progress tracking and analytics

 Support for multiple languages

 Mobile-friendly UI for accessibility

👨‍💻 Author

Spandan Panda
GitHub: Jeet206
