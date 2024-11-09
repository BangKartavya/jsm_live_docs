import CollaborativeRoom from '@/components/CollaborativeRoom';
import { getDocument } from '@/lib/actions/room.actions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'
import { getClerkUsers } from '@/lib/actions/user.actions';

const Document = async ({ params }: SearchParamProps) => {
  const { id } = await params;
  const clearkUser = await currentUser();
  if (!clearkUser) redirect('/sign-in');
  const room = await getDocument({
    roomId: id,
    userId: clearkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect('/');

  // Access permissions
  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });
  const usersData = users.map((user: User) => ({ ...user, userType: room.usersAccesses[user.email]?.includes('room:write') ? 'editor' : 'viewer' }));

  const currentUserType = room.usersAccesses[clearkUser.emailAddresses[0].emailAddress]?.includes('room:write') ? 'editor' : 'viewer';

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata} users={usersData} currentUserType={currentUserType} />
    </main>
  )
}

export default Document