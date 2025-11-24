import { NextRequest, NextResponse } from "next/server";
import { resetDatabaseInstance } from "@/lib/database/server";

/**
 * API endpoint to manually reset the database instance
 * Called during logout to ensure clean session transition
 */
export async function POST(request: NextRequest) {
  try {
    resetDatabaseInstance();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Error resetting database instance:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset database instance"
      },
      { status: 500 }
    );
  }
}
