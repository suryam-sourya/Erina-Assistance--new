import { NextResponse } from "next/server";

export const ALLOWED_ADMIN_EMAILS = [
  "abhishekbajpai680@gmail.com",
  "amanjoshi2518@gmail.com",
  "siraj@erinaassistance.com",
  "sheikhsiraj999@gmail.com",
  "suryamsourya8@gmail.com",
  "vishakhaprasad985@gmail.com",
];

/**
 * Validates a Firebase ID Token passed in the Authorization header.
 * Uses Google Identity Toolkit REST API to securely look up user accounts.
 */
export async function verifyAdminRequest(req: Request): Promise<{ authorized: boolean; email?: string; error?: string }> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, error: "Missing or malformed Authorization header" };
    }

    const idToken = authHeader.split("Bearer ")[1]?.trim();
    if (!idToken) {
      return { authorized: false, error: "Empty authorization token" };
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      console.error("Firebase API Key is missing from server environment variables!");
      return { authorized: false, error: "Server authentication setup issue" };
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn("Firebase ID Token verification request failed:", errData);
      return { authorized: false, error: "Invalid or expired authorization token" };
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user || !user.email) {
      return { authorized: false, error: "User identity lookup failed" };
    }

    const emailLower = user.email.toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.includes(emailLower)) {
      console.warn(`Unauthorized administrative access attempt by ${emailLower}`);
      return { authorized: false, error: "Access denied: Unauthorized operator identity" };
    }

    return { authorized: true, email: emailLower };
  } catch (err: any) {
    console.error("Security Authentication Helper Error:", err);
    return { authorized: false, error: "Authentication system failure" };
  }
}

/**
 * Reusable helper to send structured CORS-compliant JSON responses
 */
export function secureCorsResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
