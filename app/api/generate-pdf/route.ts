import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { MealPlanPDF } from '@/lib/pdf/meal-plan-template';
import React from 'react';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

const MAX_CONTENT_SIZE = 50 * 1024; // 50KB

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 PDF generations per minute per IP
    const clientId = getClientIdentifier(request);
    const { allowed } = checkRateLimit(`pdf:${clientId}`, 5, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate content size
    if (typeof content !== 'string' || content.length > MAX_CONTENT_SIZE) {
      return NextResponse.json(
        { error: 'Content exceeds maximum allowed size' },
        { status: 400 }
      );
    }

    // Generate PDF buffer
    const pdfElement = React.createElement(MealPlanPDF, { content });
    const pdfBuffer = await renderToBuffer(pdfElement as Parameters<typeof renderToBuffer>[0]);

    // Return PDF as blob
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="plan-nutricional-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
