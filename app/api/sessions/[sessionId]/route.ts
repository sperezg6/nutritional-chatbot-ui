import { NextRequest, NextResponse } from 'next/server';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, SESSIONS_TABLE } from '@/lib/dynamodb';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Helper to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * PATCH /api/sessions/[sessionId]
 * Update session properties (currently supports title update)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Rate limiting: 20 session updates per minute per IP
    const clientId = getClientIdentifier(request);
    const { allowed } = checkRateLimit(`sessions:${clientId}`, 20, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { sessionId } = await params;

    // Validate session ID format
    if (!isValidUUID(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title } = body;

    // Validate title
    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return NextResponse.json(
        { error: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedTitle.length > 255) {
      return NextResponse.json(
        { error: 'Title must be 255 characters or less' },
        { status: 400 }
      );
    }

    // Update the session title in DynamoDB
    const result = await docClient.send(new UpdateCommand({
      TableName: SESSIONS_TABLE,
      Key: { session_id: sessionId },
      UpdateExpression: 'SET title = :title, updated_at = :now',
      ExpressionAttributeValues: {
        ':title': trimmedTitle,
        ':now': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(session_id)',
      ReturnValues: 'ALL_NEW',
    }));

    const updated = result.Attributes;
    if (!updated) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.session_id,
        title: updated.title
      }
    });
  } catch (error: any) {
    if (error.name === 'ConditionalCheckFailedException') {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
