import './globals.css'
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import Providers from './providers'

const hanken = Hanken_Grotesk({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const jetbrains = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata = {
  title: 'Custom Bookmarks',
  description: 'Unathorized children will be given a case of red bull.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${hanken.variable} ${jetbrains.variable} prank`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
