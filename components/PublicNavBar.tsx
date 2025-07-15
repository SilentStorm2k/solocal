import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

export default function PublicNavbar() {
  return (
    <nav className='flex justify-between items-center fixed z-50 w-full h-28 bg-gray-300 px-10 gap-4 shadow-2xl'>
      {/* Logo */}
      <Link
        href='/login'
        className='flex items-center gap-1 hover:scale-150 duration-500'
      >
        <Image
          src={'/assets/logo.png'}
          width={60}
          height={60}
          quality={100}
          unoptimized
          alt='solocal logo'
        />
      </Link>

      {/* Other Nav links */}
      <section className='sticky top-0 flex justify-between'>
        <div className='flex flex-1 max-sm:gap-0 sm:gap-6'>
          <SignInButton>
            <Button className='bg-solocal-accent-muted-rose/60 hover:bg-solocal-accent-muted-rose/90 text-white font-bold py-2 px-4 border border-gray-400 cursor-pointer hover:scale-150 duration-500 rounded-2xl shadow-2xl'>
              Login
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button
              className='bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 cursor-pointer hover:scale-150 duration-500 rounded-2xl shadow-2xl'
              variant={'outline'}
            >
              Register
            </Button>
          </SignUpButton>
        </div>
      </section>
    </nav>
  );
}
