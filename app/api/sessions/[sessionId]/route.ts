import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    // Update the session title in Supabase
    const { data, error } = await supabase
      .from('sessions')
      .update({ title: trimmedTitle })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating session title:', error);

      // Check if session doesn't exist
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update session title' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title
      }
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
