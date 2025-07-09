import PublicNavbar from '@/components/PublicNavBar';
import PrivateNavbar from '@/components/PrivateNavBar';
import { currentUser } from '@clerk/nextjs/server';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  return (
    <main className='relative'>
      {/* Rendering private navbar if user signed in else public navbar */}
      {user ? <PrivateNavbar /> : <PublicNavbar />}

      {/* Render the children */}
      <section className='pt-36'>{children}</section>
    </main>
  );
}
