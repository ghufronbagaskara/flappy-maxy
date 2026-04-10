import { NextResponse } from "next/server";

import { sendScoreEmail } from "@/lib/email/sendScoreEmail";
import { sendScoreSchema } from "@/lib/validation";

interface ApiSuccessResponse {
  success: true;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiSuccessResponse | ApiErrorResponse>> {
  let unknownPayload: unknown;

  try {
    unknownPayload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid JSON payload.",
      },
      { status: 400 },
    );
  }

  const validationResult = sendScoreSchema.safeParse(unknownPayload);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Request validation failed.",
        fieldErrors: validationResult.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    await sendScoreEmail(validationResult.data);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("send-score route failed", toErrorLog(error));

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send score email. Please try again.",
      },
      { status: 500 },
    );
  }
}

function toErrorLog(error: unknown): { message: string } {
  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Unknown send-score error." };
}
