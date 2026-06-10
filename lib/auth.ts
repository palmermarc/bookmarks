import { type NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/drive',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.scope = account.scope
      }
      return token
    },
    async session({ session, token }) {
      const s = session as { accessToken?: string; hasDriveAccess?: boolean }
      s.accessToken = token.accessToken as string | undefined
      s.hasDriveAccess = typeof token.scope === 'string'
        && token.scope.includes('https://www.googleapis.com/auth/drive')
      return session
    },
  },
}
