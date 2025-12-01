import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Only run the Clerk middleware on these protected routes.
// Keep public pages like "/", "/sign-in", and "/sign-up" outside the matcher.
export const config = {
  matcher: [
    "/transactions/:path*",
    "/dashboard/:path*",
    "/accounts/:path*",
    "/profile/:path*",
    "/api/:path*", // protect API routes as well
  ],
};
