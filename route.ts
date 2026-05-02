import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 PDF files are required to merge' },
        { status: 400 }
      );
    }

    // Validate all files are PDFs
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PDF file` },
          { status: 400 }
        );
      }
      // Check file size (max 10MB per file)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each PDF file
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();

    // Return the merged PDF
    return new NextResponse(mergedPdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF merge error:', error);
    return NextResponse.json(
      { error: 'Failed to merge PDF files. Please try again.' },
      { status: 500 }
    );
  }
}
