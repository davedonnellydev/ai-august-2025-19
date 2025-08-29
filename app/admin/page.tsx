import { redirect } from 'next/navigation';
import { auth } from '@/app/auth';
import AdminTabs from './AdminTabs';

export default async function AdminPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    redirect('/');
  }

  return <AdminTabs />;
}
