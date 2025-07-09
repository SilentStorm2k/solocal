'use client';

import { SignIn } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className='flex justify-center items-center p-10 gap-24 animate-fade-in max-md:flex-col'>
      <section className='flex flex-col items-center gap-10'>
        <Image src={'/assets/logo.svg'} width={300} height={300} alt='Logo' />

        {/* Main heading */}
        <h1 className='text-2xl font-black lg:text-3xl'>
          Your time, perfectly planned
        </h1>

        {/* Subheading */}
        <p className='font-extralight'>
          Join millions of professionals who easily book meetings with the #1
          scheduling tool
        </p>

        {/* Illustration of marking calender*/}
        <Image
          src={'/assets/planning.jpeg'}
          width={500}
          height={500}
          alt='Marking your calenders'
        />
      </section>

      {/* Clerk Sign-in component, custom themed */}
      <div className='mt-3'>
        <SignIn
          routing='hash' // keeps Sign-in UI on the same page using hash-based routing
          appearance={{
            baseTheme: neobrutalism,
          }}
        />
      </div>
    </main>
  );
}
