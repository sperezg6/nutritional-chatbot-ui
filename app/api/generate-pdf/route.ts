import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { MealPlanPDF } from '@/lib/pdf/meal-plan-template';
import React from 'react';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Generate PDF buffer (using React.createElement instead of JSX)
    const pdfBuffer = await renderToBuffer(
      React.createElement(MealPlanPDF, { content })
    );

    // Return PDF as blob
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="plan-nutricional-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
