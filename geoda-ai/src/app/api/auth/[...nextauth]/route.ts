import NextAuth, {NextAuthOptions} from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  providers: [
    CognitoProvider({
      id: 'cognito-general',
      clientId: process.env.COGNITO_CLIENT_ID || '',
      clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
      issuer: process.env.COGNITO_ISSUER,
      checks: ['nonce'],
      authorization: {
        params: {
          prompt: 'select_account'
        }
      }
    }),
    CognitoProvider({
      id: 'cognito-google',
      clientId: process.env.COGNITO_CLIENT_ID || '',
      clientSecret: process.env.COGNITO_CLIENT_SECRET || '',
      issuer: process.env.COGNITO_ISSUER,
      checks: ['nonce'],
      authorization: {
        params: {
          identity_provider: 'Google',
          response_type: 'code',
          scope: 'openid email',
          prompt: 'select_account'
        }
      }
    })
  ],
  callbacks: {
    async jwt({token, account}) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
    async session({session, token}) {
      const accessToken = token.accessToken;
      console.log(accessToken);
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};
