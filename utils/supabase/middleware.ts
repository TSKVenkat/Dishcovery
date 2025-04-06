import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create a response with the CORS headers
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Set cookie on both request and response
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            // Remove cookie from both request and response
            request.cookies.delete(name);
            response.cookies.delete(name);
          },
        },
      }
    );

    // Refresh the session and get the user
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Middleware] Session error:', error);
      return response;
    }

    // Auth-related pages should redirect to protected route if user is logged in
    const authPages = ['/sign-in', '/sign-up', '/forgot-password'];
    if (authPages.includes(request.nextUrl.pathname) && session) {
      return NextResponse.redirect(new URL('/protected', request.url));
    }

    // Protected routes - redirect to sign-in if no session
    if (request.nextUrl.pathname.startsWith("/protected") && !session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect root to protected for logged in users
    if (request.nextUrl.pathname === "/" && session) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    console.error('[Middleware] Error:', e);
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
