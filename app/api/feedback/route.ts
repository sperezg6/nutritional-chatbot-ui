import { NextRequest, NextResponse } from 'next/server';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, FEEDBACK_TABLE } from '@/lib/dynamodb';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Helper to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 feedback submissions per minute per IP
    const clientId = getClientIdentifier(request);
    const { allowed } = checkRateLimit(`feedback:${clientId}`, 10, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { session_id, rating, comment } = body;

    // Validate required fields (session_id is now optional for welcome screen feedback)
    if (!rating) {
      return NextResponse.json(
        { error: 'rating is required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment && (typeof comment !== 'string' || comment.length > 500)) {
      return NextResponse.json(
        { error: 'Comment must be a string of 500 characters or less' },
        { status: 400 }
      );
    }

    // Get user agent and IP address
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      undefined;

    const validSessionId = session_id && isValidUUID(session_id) ? session_id : null;
    const now = new Date().toISOString();
    const datePartition = now.slice(0, 10); // YYYY-MM-DD

    const item: Record<string, unknown> = {
      session_id: validSessionId || `no-session-${now}`,
      created_at: now,
      date_partition: datePartition,
      rating,
    };

    if (comment) item.comment = comment;
    if (userAgent) item.user_agent = userAgent;
    if (ipAddress) item.ip_address = ipAddress;

    await docClient.send(new PutCommand({
      TableName: FEEDBACK_TABLE,
      Item: item,
    }));

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
