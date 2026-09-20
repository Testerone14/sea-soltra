import { NextResponse } from 'next/server';
import { getRawDatabase } from '@/lib/db';

export async function GET() {
    try {
        const db = await getRawDatabase();

        // Memfilter data yang hanya diizinkan untuk publik
        const publicData = db
            .filter((item) => item.isPublic)
            .map(({ id, code, name, description, publicPrice, category }) => ({
                id,
                code,
                name,
                description,
                publicPrice,
                category,
            }));

        return NextResponse.json({ success: true, data: publicData }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Gagal mengambil data' }, { status: 500 });
    }
}