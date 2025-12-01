import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const imagePath = path.join(uploadsDir, filename);
    
    // Make sure the uploads directory exists
    await mkdir(uploadsDir, { recursive: true });

    await writeFile(imagePath, buffer);
    console.log(`File uploaded to ${imagePath}`);

    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'File upload failed.' }, { status: 500 });
  }
}
