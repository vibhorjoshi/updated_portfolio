/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Chat} from '@google/genai';
import {useEffect, useState, useRef} from 'react';
import ReactDOM from 'react-dom/client';

const portfolioContext = `
Vibhor Joshi is a Machine Learning Engineer specializing in AI & Computer Vision.
Education: Bachelor of Technology in Electronics and Communication from MSIT, New Delhi (2021-2025).
Skills:
- Languages: Python, C++, SQL, JavaScript
- ML: TensorFlow, PyTorch, OpenCV, Scikit-learn
- Web: Django, FastAPI, Flask
- Data: Pandas, Spark, ElasticSearch
- Tools: Git, Docker, Kubernetes, AWS
Experience:
- Python Developer Intern at Ministry of Home Affairs: Built an OCR system for personal identification documents.
- AI Intern at National Informatics Centre (NIC): Developed a real-time anomaly detection system for infrastructure logs.
Projects:
- AgroShield: AI leaf disease diagnosis (94% accuracy).
- ChargeMap: Smart EV charging planner using K-Means.
- AceTrack: AI-powered tennis analytics with YOLOv5.
- Mystic-tarot: A cosmic wellness platform.
- Temple Run Gesture Control: Game control using MediaPipe.
Achievements: Presented at international conferences and was a finalist in several coding competitions like GEEKATHON and Code for Cause.
`;
const systemInstruction = `You are a helpful and friendly AI assistant for Vibhor Joshi's portfolio website. Your goal is to answer questions about his skills, experience, and projects based ONLY on the provided context. Do not make up information. Be conversational and encourage users to explore his work. Here is the context about Vibhor: ${portfolioContext}`;

function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
    });
    setChat(newChat);
    setMessages([{ role: 'model', text: "Hello! How can I help you learn more about Vibhor's work?" }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !chat || isLoading) return;

    const userMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
        const response = await chat.sendMessage({ message: userMessage.text });
        const modelMessage = { role: 'model', text: response.text };
        setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
        console.error("Chatbot error:", error);
        const errorMessage = { role: 'model', text: "Sorry, I'm having trouble connecting right now." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
      <div className="chat-header">
        <h3>AI Assistant</h3>
        <button onClick={onClose}>&times;</button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
        {isLoading && (
            <div className="chat-message model typing-indicator">
                <span></span><span></span><span></span>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about projects, skills..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !inputValue.trim()}>Send</button>
      </form>
    </div>
  );
}


function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isGreetingVisible, setIsGreetingVisible] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const generateGreeting = async () => {
      try {
        const response = await ai.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: 'Write a friendly, one-sentence greeting for a portfolio website. Include a relevant emoji like 👋 or ✨.',
        });

        setLoading(false);
        let greeting = '';
        for await (const chunk of response) {
          greeting += chunk.text;
          setMessage(greeting);
        }
        setTimeout(() => setIsGreetingVisible(true), 100); 
      } catch (error) {
        console.error("Failed to generate greeting:", error);
        setLoading(false);
        setMessage("Welcome to my portfolio! ✨"); // Fallback message
        setTimeout(() => setIsGreetingVisible(true), 100);
      }
    };

    generateGreeting();
  }, []);

  return (
    <>
        <div className={`gemini-greeting ${isGreetingVisible ? 'fade-in' : ''} ${loading ? 'loading' : ''}`}>
            {loading ? <p>...</p> : <p>{message}</p>}
        </div>

        <button className="chatbot-fab" onClick={() => setIsChatOpen(true)} aria-label="Open AI assistant">
            💬
        </button>
        <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}