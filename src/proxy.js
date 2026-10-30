// src/proxy.js  (next to the app folder, not inside it)
import { NextResponse } from "next/server";

export function proxy(request) {
  // Optimistic check only: is there a session cookie at all?
  // The real check (is it valid?) happens in getSession() on the server.
  if (!request.cookies.has("session")) {
    const url = new URL("/signin", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/dashboard/:path*", "/kitchen/:path*"], // only the private routes
};