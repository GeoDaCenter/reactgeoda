import React, {Suspense} from 'react';
import ThemeClient from './theme-client';
import Loading from './loading';

export const metadata = {
  title: 'GeoDa.AI',
  description: 'Powered by GeoDa'
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>
        <ThemeClient>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ThemeClient>
      </body>
    </html>
  );
}
