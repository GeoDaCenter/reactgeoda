import React from 'react';
import {NextUIProvider} from '@nextui-org/react';
import {SessionProvider} from 'next-auth/react';

const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export function Providers({children}: {children: React.ReactNode}) {
  return IS_STATIC_EXPORT ? (
    <NextUIProvider>{children}</NextUIProvider>
  ) : (
    <SessionProvider>
      <NextUIProvider>{children}</NextUIProvider>
    </SessionProvider>
  );
}
