import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { PenBox } from "lucide-react";

const Header = () => {
  return (
    <header className="container mx-auto ">
      <nav className="flex items-center justify-between py-4 px-4">
        <Link href="/">
          <Image
            src={"/logo2.png"}
            alt="Zrucm Logo"
            width={200}
            height={56}
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/project/create">
            <Button variant="destructive" className="cursor-pointer">
              <PenBox className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Create Project</span>
            </Button>
          </Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button variant="outline">Sign Up</Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;
