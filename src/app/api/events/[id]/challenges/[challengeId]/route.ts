import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; challengeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, challengeId } = await params;

    // Check if user is the organizer of this event
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizer.email !== session.user.email) {
      return NextResponse.json({ error: 'Only the event organizer can edit challenges' }, { status: 403 });
    }

    // Check if challenge exists and belongs to this event
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!existingChallenge || existingChallenge.eventId !== eventId) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const formData = await request.formData();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const difficulty = formData.get('difficulty') as string;
    const flag = formData.get('flag') as string;
    const initialPoints = parseInt(formData.get('initialPoints') as string);
    const minPoints = parseInt(formData.get('minPoints') as string);
    const decayFactor = parseInt(formData.get('decayFactor') as string);
    const file = formData.get('file') as File | null;

    if (!title || !description || !flag) {
      return NextResponse.json({ error: 'Title, description, and flag are required' }, { status: 400 });
    }

    let fileUrl = existingChallenge.fileUrl;

    // Handle file upload
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      // Validate file type (allow common file types)
      const allowedTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'text/plain',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/json',
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/octet-stream'
      ];

      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.zip') && !file.name.endsWith('.txt')) {
        return NextResponse.json({ error: 'File type not allowed. Allowed types: ZIP, TXT, PDF, images (JPG, PNG, GIF), HTML, CSS, JS, JSON' }, { status: 400 });
      }

      // Delete old file if it exists
      if (existingChallenge.fileUrl) {
        try {
          const oldFilePath = join(process.cwd(), 'public', existingChallenge.fileUrl);
          await unlink(oldFilePath);
        } catch (error) {
          console.error('Error deleting old file:', error);
        }
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create filename with timestamp to avoid conflicts and sanitize filename
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${sanitizedFileName}`;
      const filepath = join(process.cwd(), 'public', 'uploads', filename);

      try {
        await writeFile(filepath, buffer);
        fileUrl = `/uploads/${filename}`;
      } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
      }
    }

    // Update challenge
    const challenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        title,
        description,
        category,
        difficulty,
        flag,
        initialPoints,
        minPoints,
        decayFactor,
        fileUrl,
      },
    });

    return NextResponse.json(challenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; challengeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId, challengeId } = await params;

    // Check if user is the organizer of this event
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizer.email !== session.user.email) {
      return NextResponse.json({ error: 'Only the event organizer can delete challenges' }, { status: 403 });
    }

    // Check if challenge exists and belongs to this event
    const existingChallenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!existingChallenge || existingChallenge.eventId !== eventId) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
    }

    // Delete associated file if it exists
    if (existingChallenge.fileUrl) {
      try {
        const filePath = join(process.cwd(), 'public', existingChallenge.fileUrl);
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // Delete challenge (this will cascade delete solves due to schema constraints)
    await prisma.challenge.delete({
      where: { id: challengeId },
    });

    return NextResponse.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
