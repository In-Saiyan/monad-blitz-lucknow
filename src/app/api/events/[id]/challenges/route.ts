import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    
    const challenges = await prisma.challenge.findMany({
      where: { eventId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        initialPoints: true,
        minPoints: true,
        decayFactor: true,
        fileUrl: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: eventId } = await params;

    // Check if user is the organizer of this event
    const event = await prisma.cTFEvent.findUnique({
      where: { id: eventId },
      include: { organizer: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizer.email !== session.user.email) {
      return NextResponse.json({ error: 'Only the event organizer can create challenges' }, { status: 403 });
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

    let fileUrl: string | undefined;

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

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create filename with timestamp to avoid conflicts and sanitize filename
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}_${sanitizedFileName}`;
      const filepath = join(process.cwd(), 'public', 'uploads', filename);

      // Ensure uploads directory exists
      try {
        await writeFile(filepath, buffer);
        fileUrl = `/uploads/${filename}`;
      } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
      }
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
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
        eventId,
      },
    });

    return NextResponse.json(challenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
