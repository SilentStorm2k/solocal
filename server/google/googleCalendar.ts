'use server';

import { clerkClient } from '@clerk/nextjs/server';
import { addMinutes, endOfDay, startOfDay } from 'date-fns';
import { calendar_v3, google } from 'googleapis';

async function getOAuthClient(clerkUserId: string) {
  try {
    const client = await clerkClient();

    const { data } = await client.users.getUserOauthAccessToken(
      clerkUserId,
      'google',
    );

    if (data.length == 0 || !data[0].token)
      throw new Error('No OAuth data or token found for the user.');

    const oAuthClient = new google.auth.OAuth2({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
    });

    oAuthClient.setCredentials({ access_token: data[0].token });

    return oAuthClient;
  } catch (error: any) {
    throw new Error(`Failed to get OAuth client: ${error.message ?? error}`);
  }
}

export async function getCalendarEventTimes(
  clerkUserId: string,
  { start, end }: { start: Date; end: Date },
): Promise<{ start: Date; end: Date }[]> {
  try {
    // Try getting the OAuth client
    const oAuthClient = await getOAuthClient(clerkUserId);

    if (!oAuthClient) throw new Error(`OAuth client could not be obtained`);

    const events = await google.calendar('v3').events.list({
      calendarId: 'primary',
      eventTypes: ['default'],
      singleEvents: true,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      maxResults: 1500, // limit number of returned events (max allowed by Google)
      auth: oAuthClient,
    });

    return (
      events.data.items
        ?.map((event) => {
          // for all day events
          if (event.start?.date && event.end?.date) {
            return {
              start: startOfDay(new Date(event.start.date)),
              end: endOfDay(new Date(event.end.date)),
            };
          }
          if (event.start?.dateTime && event.end?.dateTime) {
            return {
              start: new Date(event.start.dateTime),
              end: new Date(event.end.dateTime),
            };
          }
          return undefined;
        })
        .filter(
          (date): date is { start: Date; end: Date } => date !== undefined,
        ) || []
    );
  } catch (error: any) {
    throw new Error(`Failed to fetch calendar events: ${error.message}`);
  }
}

export async function createCalendarEvent({
  clerkUserId,
  guestName,
  guestEmail,
  startTime,
  guestNotes,
  durationInMinutes,
  eventName,
}: {
  clerkUserId: string;
  guestName: string;
  guestEmail: string;
  startTime: Date;
  guestNotes?: string | null;
  durationInMinutes: number;
  eventName: string;
}): Promise<calendar_v3.Schema$Event> {
  try {
    const oAuthClient = await getOAuthClient(clerkUserId);

    if (!oAuthClient) throw new Error(`OAuth client could not be obtained`);

    const client = await clerkClient();
    const calendarUser = await client.users.getUser(clerkUserId);

    const primaryEmail = calendarUser.emailAddresses.find(
      ({ id }) => id === calendarUser.primaryEmailAddressId,
    );

    const calendarEvent = await google.calendar('v3').events.insert({
      calendarId: 'primary',
      auth: oAuthClient,
      sendUpdates: 'all',
      requestBody: {
        attendees: [
          { email: guestEmail, displayName: guestName },
          {
            email: primaryEmail?.emailAddress,
            displayName: `${calendarUser.firstName} ${calendarUser.lastName}`,
            responseStatus: 'accepted',
          },
        ],
        description: guestNotes
          ? `Additional details: ${guestNotes}`
          : 'No additional details',
        start: {
          dateTime: startTime.toISOString(),
        },
        end: {
          dateTime: addMinutes(startTime, durationInMinutes).toISOString(),
        },
        summary: `${guestName} + ${calendarUser.firstName} ${calendarUser.lastName} : ${eventName}`,
      },
    });

    return calendarEvent.data;
  } catch (error: any) {
    throw new Error(
      `Failed to create new google calendar event: ${error.message}`,
    );
  }
}
