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
          <h1 className="text-4xl bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500
          bg-clip-text font-extrabold text-transparent pb-2">ProjectRack</h1>
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
