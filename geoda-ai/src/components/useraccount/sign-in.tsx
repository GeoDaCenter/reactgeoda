'use client';
import {useDispatch, useSelector} from 'react-redux';
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from '@nextui-org/react';
import {GeoDaState} from '../../store';
import {setSignInModal} from '../../actions';
// import {authOptions} from '../../app/api/auth/[...nextauth]';
// //import {useState} from 'react';
// import {signIn, signOut} from 'next-auth/react';
// import {getServerSession} from 'next-auth/next';

// export function SignIn({session}) {
//   //const [error, setError] = useState('');

//   return (
//     <div>
//       {/*error && <div style={{color: 'red', marginBottom: '10px'}}>Error signing in: {error}</div>*/}
//       {!session ? (
//         <button onClick={() => signIn()}>Sign in</button>
//       ) : (
//         <>
//           <h1>Welcome</h1>
//           <button onClick={() => signOut()}>Sign out</button>
//         </>
//       )}
//     </div>
//   );
// }

import {useSession, signIn, signOut} from 'next-auth/react';

export function SignIn() {
  const {data: session} = useSession();
  if (session && session.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}

export function UserAccountModal() {
  // get the dispatch function from the redux store
  const dispatch = useDispatch();
  const session = useSession();

  // When rendering client side don't display anything until loading is complete
  // if (typeof window !== 'undefined' && !session) return null;

  const showSignInModal = useSelector((state: GeoDaState) => state.root.uiState.showSignInModal);

  const onCloseModal = () => {
    dispatch(setSignInModal(false));
  };

  return session.data === null ? (
    <SignIn />
  ) : (
    <>
      <Modal isOpen={showSignInModal} onClose={onCloseModal}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className="flex flex-col gap-1">Welcome Back!</ModalHeader>
              <ModalBody>
                <p>{session.data?.user?.email}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
