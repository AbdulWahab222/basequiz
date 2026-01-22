import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Quiz Mini App',
  description: 'Generate and play quizzes on any topic with AI',
  other: {
    'base:app_id': '6971838e8ffff7b10d18723c',
  },
  openGraph: {
    title: 'AI Quiz Mini App',
    description: 'Generate and play quizzes on any topic with AI',
    images: ['/og-image.svg'],
    url: 'https://your-quiz-name.vercel.app',
    siteName: 'AI Quiz Mini App',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Quiz Mini App',
    description: 'Generate and play quizzes on any topic with AI',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
