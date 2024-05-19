import React, {Suspense} from 'react';
import {GoogleAnalytics} from '@next/third-parties/google';
import ThemeClient from './theme-client';
import Loading from './loading';
import {Providers} from './providers';
import StyledComponentsRegistry from '../lib/registry';

export const metadata = {
  title: 'GeoDa.AI',
  description: 'Powered by GeoDa'
};

// for <Providers> see https://nextui.org/docs/frameworks/nextjs

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="light">
      <head>
        <script>
          {`
HTMLCanvasElement.prototype.getContext = function(origFn) {
  return function(type, attribs) {
    attribs = attribs || {};
    attribs.preserveDrawingBuffer = true;
    attribs.alpha = true;
    attribs.antialias = true;
    attribs.depth = true;
    return origFn.call(this, type, attribs);
  };
}(HTMLCanvasElement.prototype.getContext);
          `}
        </script>
      </head>
      <body>
        <StyledComponentsRegistry>
          <Providers>
            <ThemeClient>
              <Suspense fallback={<Loading />}>{children}</Suspense>
            </ThemeClient>
          </Providers>
        </StyledComponentsRegistry>
      </body>
      <GoogleAnalytics gaId="G-JB0GMHF7MC" />
    </html>
  );
}
