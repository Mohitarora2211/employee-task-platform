"use client";

import { UserButton } from "@clerk/nextjs";

export default function UserMenu() {
  return (
    <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-700/60 px-3 py-1.5 rounded-full backdrop-blur-md shadow-inner">
      <UserButton 
        appearance={{
          elements: {
            userButtonAvatarBox: "w-9 h-9 rounded-full ring-2 ring-blue-500/40",
          }
        }}
        afterSignOutUrl="/sign-in" 
      />
    </div>
  );
}
