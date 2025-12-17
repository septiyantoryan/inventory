import { Hono } from 'hono';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { writeFile } from 'fs/promises';

const app = new Hono();

// Ensure upload directory exists
const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

// Upload image endpoint
app.post('/', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || !(file instanceof File)) {
            return c.json({ success: false, message: 'No file uploaded' }, 400);
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            return c.json({
                success: false,
                message: 'Format file tidak didukung. Gunakan JPG, JPEG, atau PNG'
            }, 400);
        }

        // Validate file size (1MB = 1048576 bytes)
        if (file.size > 1048576) {
            return c.json({
                success: false,
                message: 'Ukuran file terlalu besar. Maksimal 1MB'
            }, 400);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}.${extension}`;
        const filepath = join(uploadDir, filename);

        // Save file
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filepath, buffer);

        // Return file URL
        const fileUrl = `/uploads/${filename}`;

        return c.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename,
                url: fileUrl,
                size: file.size,
                type: file.type
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        return c.json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to upload file'
        }, 500);
    }
});

export default app;
