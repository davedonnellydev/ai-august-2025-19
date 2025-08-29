'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Notifications } from '@mantine/notifications';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Notifications position="top-right" limit={3} />
      {children}
    </SessionProvider>
  );
}
