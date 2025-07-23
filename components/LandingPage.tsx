'use client';

import { SignIn } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className='flex flex-col items-center justify-center p-10 animate-fade-in bg-[#3f1c23] min-h-screen'>
      <header className='text-center mb-12 max-w-3xl'>
        <Image
          src={'/assets/fullLogo.png'}
          width={300}
          height={300}
          quality={100}
          unoptimized
          alt='SoloCal Logo'
          className='mx-auto mb-6'
        />

        {/* Main heading */}
        <h1 className='text-4xl font-black lg:text-5xl text-[#e9c47b]'>
          SoloCal: Your Time, Perfectly Planned.
        </h1>

        {/* Subheading */}
        <p className='font-light text-xl mt-4 leading-relaxed'>
          SoloCal simplifies how you manage events and availability, allowing
          you to focus on your work, not your calendar. Create events, define
          your free time, and share unique booking links with ease.
        </p>
      </header>

      {/* Main content sections */}
      <section className='flex flex-col md:flex-row justify-center items-start gap-16 max-w-6xl w-full mb-16'>
        {/* App Description Section */}
        <div className='flex-1 bg-[#5a2e38] p-8 rounded-lg shadow-xl border border-[#7d4653]'>
          <h2 className='text-3xl font-bold text-[#e9c47b] mb-6'>
            What SoloCal Offers You
          </h2>
          <p className='text-lg mb-4 leading-relaxed'>
            SoloCal is a comprehensive scheduling application designed for
            professionals. It streamlines your event management by:
          </p>
          <ul className='list-disc list-inside text-lg space-y-3 mb-6'>
            <li>
              <span className='font-bold'>Easy Event Creation:</span> Quickly
              set up new events with custom titles, descriptions, and durations.
            </li>
            <li>
              <span className='font-bold'>Define Your Availability:</span> Mark
              your free slots, busy times, and create personal booking rules.
            </li>
            <li>
              <span className='font-bold'>Shareable Booking Links:</span>{' '}
              Generate unique links for guests to book meetings directly into
              your schedule, eliminating back-and-forth emails.
            </li>
            <li>
              <span className='font-bold'>Seamless Google Calendar Sync:</span>{' '}
              All your SoloCal events automatically appear on your Google
              Calendar, keeping everything in one place.
            </li>
            <li>
              <span className='font-bold'>Simplified Scheduling:</span> Join
              millions of professionals who use smart scheduling tools to save
              time and increase productivity.
            </li>
          </ul>
          <Image
            src={'/assets/planning.jpeg'} // Your illustration
            width={500}
            height={500}
            quality={100}
            unoptimized
            alt='Marking your calendars'
            className='mx-auto mt-6 rounded-md shadow-md'
          />
        </div>

        {/* Clerk Sign-in Component */}
        <div className='flex-shrink-0 mt-3 flex justify-center items-center'>
          <SignIn
            routing='hash' // keeps Sign-in UI on the same page using hash-based routing
            appearance={{
              baseTheme: neobrutalism,
            }}
          />
        </div>
      </section>

      {/* How We Use Your Google Data Section (CRITICAL for sensitive scopes) */}
      <section className='w-full max-w-6xl bg-[#5a2e38] p-8 rounded-lg shadow-xl border border-[#7d4653] mb-16'>
        <h2 className='text-3xl font-bold text-[#e9c47b] mb-6'>
          How SoloCal Uses Your Google Data
        </h2>
        <p className='text-lg mb-4 leading-relaxed'>
          SoloCal integrates seamlessly with your Google account to provide its
          core scheduling functionality. We are committed to transparency and
          only request access to the data necessary for our features to work,
          and we use it strictly for the purposes outlined below.
        </p>
        <ul className='list-disc list-inside text-lg space-y-3 mb-6'>
          <li>
            <span className='font-bold'>
              Google Calendar (`https://www.googleapis.com/auth/calendar`):
            </span>
            <p className='ml-4'>
              SoloCal requires{' '}
              <span className='font-bold'>
                full read/write access to your Google Calendars
              </span>
              . This sensitive scope is essential for:
            </p>
            <ul className='list-circle list-inside ml-8 mt-2 space-y-1'>
              <li>
                <span className='font-bold'>Event Creation:</span> When a guest
                books a time slot through your SoloCal link, our app creates a
                new event directly on your Google Calendar. This is the primary
                function for scheduling meetings.
              </li>
              <li>
                <span className='font-bold'>Availability Syncing:</span> SoloCal
                reads your Google Calendar to understand your busy times and
                accurately display your free slots to guests. We do not store
                your calendar event details on our servers beyond what's
                necessary to determine availability and create new events.
              </li>
              <li>
                <span className='font-bold'>Custom Event Details:</span> We use
                this scope to populate event titles, descriptions, and other
                details that you define within SoloCal directly into the Google
                Calendar event, ensuring your scheduled meetings are accurate
                and complete.
              </li>
            </ul>
          </li>
          <li>
            <span className='font-bold'>
              Google Profile Information
              (`https://www.googleapis.com/auth/userinfo.email`,
              `https://www.googleapis.com/auth/userinfo.profile`):
            </span>
            <p className='ml-4'>
              We use your email address to identify your account and to send you
              important notifications related to your bookings and calendar
              events. We use your basic profile information (like your name and
              profile picture) to personalize your SoloCal experience and
              display it to guests who are booking with you.
            </p>
          </li>
        </ul>
        <p className='text-lg mt-6 leading-relaxed'>
          <span className='font-bold'>
            SoloCal does not share your Google user data with third parties.
          </span>{' '}
          All data accessed is used exclusively to provide and improve the
          functionality of the SoloCal application for you. Your privacy and
          data security are our top priorities.
        </p>
      </section>
    </main>
  );
}
