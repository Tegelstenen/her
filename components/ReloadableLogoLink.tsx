'use client';

import Link from "next/link";
import { HerLogo } from "./logos";

export function ReloadableLogoLink() {
  return (
    <Link href={"/"} prefetch={true} onClick={() => window.location.reload()}>
      <HerLogo className={"h-[15px] w-auto hover:text-gray-500"} />
    </Link>
  );
} 