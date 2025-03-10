import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserAuthForm } from "@/components/forms/user-auth-form";
import { Icons } from "@/components/shared/icons";
import CodeMatrixBackground from "@/components/animated-background/code-matrix-background";

export const metadata: Metadata = {
  title: "Login | NEXTPION",
  description: "Login to your NEXTPION account",
};

export default function LoginPage() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <CodeMatrixBackground 
          glitchColors={["#2b4539", "#61dca3", "#61b3dc"]} 
          glitchSpeed={80}
          outerVignette={false}
          centerVignette={true}
          smooth={true}
          density={1.2}
          fontSize={14}
          vignetteSize={140}
          vignetteIntensity={1.1}
          binaryMode={false}
        />
      </div>
      <div className="container relative flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px] z-10">
          <div className="flex flex-col space-y-4 text-center justify-center mb-4">
            <div className="flex justify-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <Image src="/favicon.png" alt="Logo" width={500} height={500} className="dark:hidden" />
                <Image src="/favicon-white.png" alt="Logo" width={500} height={500} className="hidden dark:block" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to sign in to your account
            </p>
          </div>
          <Suspense>
            <UserAuthForm />
          </Suspense>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link
              href="/register"
              className="hover:text-primary underline underline-offset-4"
            >
              Don&apos;t have an account? Sign Up
            </Link>
          </p>
        </div>
        <div className="absolute bottom-4 text-center text-xs text-muted-foreground z-10">
          &copy; {new Date().getFullYear()} NEXTPION. All rights reserved.
        </div>
      </div>
    </>
  );
}
