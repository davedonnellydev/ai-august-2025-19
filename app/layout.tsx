import '@mantine/core/styles.css';

import React from 'react';
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from '@mantine/core';
import { theme } from '../theme';
import Providers from './providers';
import AppFrame from './components/AppFrame';

export const metadata = {
  title: 'Content Club',
  description:
    'An AI powered "content" club manager app built for AIAugust App a Day Challenge',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Providers>
            <AppFrame>{children}</AppFrame>
          </Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
