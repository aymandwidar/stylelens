import { useState, useEffect, useRef } from 'react'
import aiService from '../services/ai'
import * as mockData from '../services/mockData'
import './StylistChat.css'

const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
)

const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
)

const SparklesIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
        <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75L19 3z" />
    </svg>
)

function StylistChat() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm your AI stylist. I can help you with color combinations, outfit suggestions, and fashion advice. What would you like to know?",
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)
    const recognitionRef = useRef(null)

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Initialize speech recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = 'en-US'

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                setIsListening(false)
            }

            recognitionRef.current.onerror = () => {
                setIsListening(false)
                setError('Voice recognition failed. Please try again.')
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }
    }, [])

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            setError('Voice recognition not supported in this browser.')
            return
        }

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            setIsListening(true)
            setError(null)
            recognitionRef.current.start()
        }
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setError(null)

        try {
            const isDemoMode = localStorage.getItem('demo_mode') === 'true'
            let response;

            if (isDemoMode) {
                await new Promise(resolve => setTimeout(resolve, 1000)) // Fake delay
                await new Promise(resolve => setTimeout(resolve, 1000)) // Fake delay
                response = mockData.getMockChatResponse(userMessage.content)
            } else {
                // Get user profile from localStorage if exists
                const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}')

                response = await aiService.chat(userMessage.content, {
                    userProfile: userProfile.skinTone ? userProfile : null
                })
            }

            const assistantMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (err) {
            console.error('Chat error:', err)
            setError(err.message || 'Failed to get response. Please check your active provider in Settings or enable Demo Mode.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const suggestedQuestions = [
        "What colors go well with navy blue?",
        "How do I style a white shirt?",
        "What's the difference between warm and cool tones?",
        "Suggest an outfit for a business meeting"
    ]

    const handleSuggestion = (question) => {
        setInput(question)
    }

    return (
        <div className="chat-page">
            <div className="chat-header glass-card">
                <div className="chat-header-content">
                    <div className="chat-avatar">
                        <SparklesIcon />
                    </div>
                    <div>
                        <h2>AI Stylist</h2>
                        <p className="chat-status">Online • Ready to help</p>
                    </div>
                </div>
            </div>

            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                    >
                        <div className="message-bubble glass-card">
                            <p>{message.content}</p>
                            <span className="message-time">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message message-assistant">
                        <div className="message-bubble glass-card">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="chat-error">
                        <p>{error}</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && !isLoading && (
                <div className="suggested-questions">
                    <p className="suggestions-label">Try asking:</p>
                    <div className="suggestions-grid">
                        {suggestedQuestions.map((question, index) => (
                            <button
                                key={index}
                                className="suggestion-chip glass-card"
                                onClick={() => handleSuggestion(question)}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="chat-input-container">
                <div className="chat-input glass-card">
                    <button
                        className={`btn-icon ${isListening ? 'listening' : ''}`}
                        onClick={handleVoiceInput}
                        aria-label="Voice input"
                    >
                        <MicIcon />
                    </button>

                    <input
                        type="text"
                        className="chat-text-input"
                        placeholder={isListening ? "Listening..." : "Ask me anything about fashion..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading || isListening}
                    />

                    <button
                        className="btn-icon btn-send"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StylistChat
