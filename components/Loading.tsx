'use client';

import { TrophySpin } from 'react-loading-indicators';
export function Loading() {
  return (
    <div className='flex flex-col items-center justify-center h-screen animate-fade-in pt-16'>
      <TrophySpin
        color='#f5f1e6'
        size='large'
        text='Loading...'
        textColor='black'
      />
    </div>
  );
}
