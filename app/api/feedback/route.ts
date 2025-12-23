import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export async function POST(request: NextRequest) {
  try {
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

    // Get user agent and IP address
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      undefined;

    // Prepare feedback data
    // Only include session_id if it's a valid UUID (not "welcome-screen" or other invalid values)
    const validSessionId = session_id && isValidUUID(session_id) ? session_id : null;

    const feedbackData: any = {
      rating,
    };

    // Only add session_id if it's valid
    if (validSessionId) {
      feedbackData.session_id = validSessionId;
    }

    if (comment) {
      feedbackData.comment = comment;
    }
    if (userAgent) {
      feedbackData.user_agent = userAgent;
    }
    if (ipAddress) {
      feedbackData.ip_address = ipAddress;
    }

    // Save feedback to Supabase
    const { data, error } = await supabase
      .from('session_feedback')
      .insert(feedbackData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
