import {Button, Card, CardBody} from '@nextui-org/react';
import {useSession, signIn, signOut} from 'next-auth/react';

export function SignIn() {
  const {data: session} = useSession();
  const handleCognitoSignIn = () => {
    signIn('cognito-general');
  };
  const handleGoogleSignIn = () => {
    signIn('cognito-google');
  };
  if (session && session.user) {
    return (
      <>
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 p-4">
              Signed in as {session.user.email} <br />
              <Button color="danger" onClick={() => signOut({callbackUrl: '/logout'})}>
                Sign out
              </Button>
            </div>
          </CardBody>
        </Card>
      </>
    );
  }
  return (
    <>
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 p-4">
            <p>Login to your account</p>
            <Button className="login-with-google-btn" onClick={handleGoogleSignIn}>
              Continue with Google
            </Button>
            <Button color="danger" onClick={handleCognitoSignIn}>
              Sign in
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
