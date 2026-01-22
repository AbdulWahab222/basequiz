'use client'

import { useState, useEffect } from 'react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface Quiz {
  id: string
  topic: string
  questions: Question[]
  createdAt: number
}

type QuizState = 'home' | 'quiz' | 'result'

export default function Home() {
  const [quizState, setQuizState] = useState<QuizState>('home')
  const [topic, setTopic] = useState('')
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [savedQuizzes, setSavedQuizzes] = useState<Quiz[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Load saved quizzes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedQuizzes')
    if (saved) {
      setSavedQuizzes(JSON.parse(saved))
    }
  }, [])

  // Save quizzes to localStorage whenever they change
  useEffect(() => {
    if (savedQuizzes.length > 0) {
      localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes))
    }
  }, [savedQuizzes])

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Time's up - calculate score and show results
      setIsTimerRunning(false)
      if (quizState === 'quiz') {
        calculateScore()
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timeLeft, quizState])

  // Generate quiz questions based on topic using Ollama
  const generateQuiz = async () => {
    if (!topic.trim()) return

    setIsGenerating(true)
    
    try {
      // Call our API route which communicates with Ollama
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate quiz')
      }

      const data = await response.json()
      const questions: Question[] = data.questions

      const newQuiz: Quiz = {
        id: Date.now().toString(),
        topic,
        questions,
        createdAt: Date.now()
      }

      setCurrentQuiz(newQuiz)
      setCurrentQuestionIndex(0)
      setSelectedAnswers([])
      setScore(0)
      setTimeLeft(300) // Reset timer to 5 minutes
      setIsTimerRunning(true)
      setQuizState('quiz')
    } catch (error) {
      console.error('Error generating quiz:', error)
      alert('Failed to generate quiz. Please make sure Ollama is running on localhost:11434.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < currentQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      calculateScore()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    currentQuiz!.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++
      }
    })
    setScore(correct)
    setIsTimerRunning(false) // Stop the timer
    setQuizState('result')
  }

  const handleRestart = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setScore(0)
    setTimeLeft(300) // Reset timer to 5 minutes
    setIsTimerRunning(true)
    setQuizState('quiz')
  }

  const handleNewQuiz = () => {
    setTopic('')
    setCurrentQuiz(null)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setScore(0)
    setIsTimerRunning(false) // Stop the timer
    setQuizState('home')
  }

  const saveCurrentQuiz = () => {
    if (currentQuiz && !savedQuizzes.find(q => q.id === currentQuiz.id)) {
      setSavedQuizzes([...savedQuizzes, currentQuiz])
    }
  }

  const loadSavedQuiz = (quiz: Quiz) => {
    setCurrentQuiz(quiz)
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setScore(0)
    setTimeLeft(300) // Reset timer to 5 minutes
    setIsTimerRunning(true)
    setQuizState('quiz')
  }

  const deleteSavedQuiz = (quizId: string) => {
    setSavedQuizzes(savedQuizzes.filter(q => q.id !== quizId))
  }

  // Share functionality using MiniKit-style share
  const shareResult = async () => {
    const shareText = `🎯 I scored ${score}/${currentQuiz!.questions.length} on the "${currentQuiz!.topic}" quiz! Can you beat my score?`
    const shareUrl = window.location.href

    // Try to use Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Quiz Result',
          text: shareText,
          url: shareUrl
        })
        return
      } catch (err) {
        console.log('Web Share API failed, falling back to clipboard')
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\nPlay here: ${shareUrl}`)
      alert('Result copied to clipboard! Share it with your friends.')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🧠 AI Quiz Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create and play quizzes on any topic
          </p>
        </header>

        {/* Home Screen */}
        {quizState === 'home' && (
          <div className="space-y-6">
            {/* Topic Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <label htmlFor="topic" className="block text-lg font-semibold mb-3">
                Enter a topic for your quiz:
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateQuiz()}
                placeholder="e.g., Cryptocurrency, Space Exploration, AI, etc."
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white transition-colors"
              />
              <button
                onClick={generateQuiz}
                disabled={isGenerating || !topic.trim()}
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGenerating ? '⏳ Generating Quiz...' : '🚀 Generate Quiz'}
              </button>
            </div>

            {/* Saved Quizzes */}
            {savedQuizzes.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4">📚 Saved Quizzes</h2>
                <div className="space-y-3">
                  {savedQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div>
                        <h3 className="font-semibold">{quiz.topic}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {quiz.questions.length} questions
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadSavedQuiz(quiz)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Play
                        </button>
                        <button
                          onClick={() => deleteSavedQuiz(quiz.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Screen */}
        {quizState === 'quiz' && currentQuiz && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Topic: {currentQuiz.topic}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Timer Display */}
            <div className={`bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border-2 ${
              timeLeft <= 60 ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-center gap-3">
                <span className={`text-2xl font-bold ${
                  timeLeft <= 60 ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  ⏱️ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
                {timeLeft <= 60 && (
                  <span className="text-sm text-red-600 font-semibold animate-pulse">
                    Hurry up!
                  </span>
                )}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold mb-6">
                {currentQuiz.questions[currentQuestionIndex].question}
              </h2>

              <div className="space-y-3">
                {currentQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAnswers[currentQuestionIndex] === index
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                    }`}
                  >
                    <span className="font-semibold mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedAnswers[currentQuestionIndex] === undefined}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {currentQuestionIndex === currentQuiz.questions.length - 1
                    ? 'Finish Quiz'
                    : 'Next →'}
                </button>
              </div>
            </div>

            {/* Save Quiz Button */}
            {!savedQuizzes.find(q => q.id === currentQuiz.id) && (
              <button
                onClick={saveCurrentQuiz}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                💾 Save Quiz for Later
              </button>
            )}
          </div>
        )}

        {/* Result Screen */}
        {quizState === 'result' && currentQuiz && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <h2 className="text-3xl font-bold mb-4">🎉 Quiz Complete!</h2>
              <div className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {score}/{currentQuiz.questions.length}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {score === currentQuiz.questions.length
                  ? 'Perfect score! You\'re an expert! 🏆'
                  : score >= currentQuiz.questions.length * 0.7
                  ? 'Great job! You know your stuff! 🌟'
                  : score >= currentQuiz.questions.length * 0.5
                  ? 'Good effort! Keep learning! 📚'
                  : 'Keep practicing! You\'ll get there! 💪'}
              </p>

              {/* Share Button */}
              <button
                onClick={shareResult}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] mb-4"
              >
                📤 Share Your Result
              </button>
            </div>

            {/* Review Answers */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">📝 Review Your Answers</h3>
              <div className="space-y-4">
                {currentQuiz.questions.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer
                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-xl border-2 ${
                        isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      }`}
                    >
                      <p className="font-semibold mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Your answer:</span>{' '}
                        {selectedAnswers[index] !== undefined
                          ? question.options[selectedAnswers[index]]
                          : 'Not answered'}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          <span className="font-medium">Correct answer:</span>{' '}
                          {question.options[question.correctAnswer]}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                          💡 {question.explanation}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleRestart}
                className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                🔄 Try Again
              </button>
              <button
                onClick={handleNewQuiz}
                className="flex-1 py-4 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors"
              >
                ➕ New Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
