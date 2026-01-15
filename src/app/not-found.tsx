import Link from "next/link";
export const dynamic = "force-dynamic";
import ButtonSupport from "@/core/components/Button/ButtonSupport";
import { HomeIcon } from "@/shared/svgs";
import { NotFoundIllustration } from "@/shared/svgs/NotFoundIllustration";
// Simple 404 page with a button to go home and a button to contact support
// Show a cute SVG with your primary color
export default function Custom404() {
  return (
    <section className="relative bg-base-100 text-base-content h-screen w-full flex flex-col justify-center gap-8 items-center p-10">
      <div className="p-6 bg-white rounded-xl">
        <NotFoundIllustration className="w-56 h-56" />
      </div>
      <p className="text-lg md:text-xl font-semibold">
        This page doesn&apos;t exist 😅
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/" className="btn btn-sm">
          <HomeIcon className="w-5 h-5" />
          Home
        </Link>

        <ButtonSupport />
      </div>
    </section>
  );
}
