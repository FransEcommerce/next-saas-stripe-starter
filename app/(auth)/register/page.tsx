import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { Metadata } from "next"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthForm } from "@/components/forms/user-auth-form"
import { Icons } from "@/components/shared/icons"
import CodeRainBackground from "@/components/animated-background/code-rain-background"

export const metadata: Metadata = {
  title: "Create an account | NEXTPION",
  description: "Create an account to get started.",
}

export default function RegisterPage() {
  return (
    <>
      <div className="fixed inset-0 z-0">
        <CodeRainBackground 
          colors={["#2b4539", "#61dca3", "#61b3dc"]}
          fallSpeed={10}
          outerVignette={false}
          centerVignette={true}
          density={0.5}
          spawnRate={0.8}
          fontSize={14}
          vignetteSize={150}
          vignetteIntensity={1}
          rainLengthRange={[5, 30]}
          binaryMode={true}
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
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <Suspense>
            <UserAuthForm type="register" />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-primary underline underline-offset-4"
            >
              Already have an account? Login
            </Link>
          </p>
        </div>
        <div className="absolute bottom-4 text-center text-xs text-muted-foreground z-10">
          &copy; {new Date().getFullYear()} NEXTPION. All rights reserved.
        </div>
      </div>
    </>
  )
}
