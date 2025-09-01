import './globals.css'
import { Roboto } from 'next/font/google'
import Providers from './providers'

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
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
      <body className={roboto.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
