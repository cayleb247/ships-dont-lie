"use client";

import Image from "next/image";

export default function GameEnded() {
  return (
    <div className="flex w-screen h-screen justify-center items-center flex-col gap-2 color-white relative">
      <Image alt="zach latta" src="/zach_latta.png" fill />
    </div>
  );
}
