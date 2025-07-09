'use client';

import { BlinkBlur } from 'react-loading-indicators';

export default function Booking() {
  return (
    <div>
      <BlinkBlur
        color='#2b7fff'
        size='large'
        text="Booking event, don't click back or refresh the page..."
        textColor='black'
      />
    </div>
  );
}
