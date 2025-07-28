import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtected = createRouteMatcher([
  "/onboarding(.*)",
  "/project/create(.*)",
])

export default clerkMiddleware(async (auth, req) =>{
  const { userId, redirectToSignIn, orgId } = await auth()

  // console.log("clerk orgId", orgId)

   const pathname = req.nextUrl.pathname;

  if(!userId && isProtected(req)) {
    return redirectToSignIn();
  }

   const skipOrgCheckRoutes = ["/", "/onboarding", "/api/user","/api/activity","/api/dashboard"];
  if (
    userId &&
    !orgId &&
    !skipOrgCheckRoutes.includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }
},{
  // authorizedParties: ["scrum-omega.vercel.app", "localhost:3000","projectrack.akshatchopra.live"],
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};