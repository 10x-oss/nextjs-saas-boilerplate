import Link from "next/link";
import ButtonSupport from "@/core/components/Button/ButtonSupport";
import { HomeIcon } from "@/shared/svgs";

export default function Custom500() {
  return (
    <section className="relative bg-neutral text-neutral-content h-screen w-full flex flex-col justify-center gap-8 items-center p-10">
      <p className="text-xl md:text-2xl font-medium">Something went wrong 😅</p>

      <Link href="/" className="btn">
        <HomeIcon className="w-5 h-5" />
        Home
      </Link>

      <ButtonSupport />
    </section>
  );
}
