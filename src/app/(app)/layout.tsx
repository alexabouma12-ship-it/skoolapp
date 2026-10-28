import Link from "next/link";
import { NavigationBas, NavigationHaut } from "@/components/navigation";

export default function LayoutApp({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-black">
        <div className="mx-auto flex h-11 max-w-[980px] items-center justify-between px-4">
          <Link href="/" className="text-[15px] font-semibold tracking-[-0.02em] text-white">
            Skoolapp
          </Link>
          <NavigationHaut />
        </div>
      </header>
      <main className="mx-auto w-full max-w-[980px] flex-1 px-4 pt-6 pb-28 sm:pt-10 sm:pb-16">{children}</main>
      <NavigationBas />
    </>
  );
}
