import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // Redirect authenticated users from home to dashboard
  if (req.nextUrl.pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
  
  // Redirect unauthenticated users trying to access protected routes
  if (!userId && !isPublicRoute(req) && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

