import { NextResponse } from 'next/server';
import { getRawDatabase, saveDatabase } from '@/lib/db';

// Read: Ambil semua data untuk Portal Admin
export async function GET() {
    const db = await getRawDatabase();
    return NextResponse.json({ success: true, data: db });
}

// Create: Tambah produk baru
export async function POST(request) {
    try {
        const body = await request.json();
        const db = await getRawDatabase();

        const newItem = {
            id: Date.now().toString(),
            code: body.code,
            name: body.name,
            description: body.description || '',
            basePrice: Number(body.basePrice),
            minMargin: Number(body.minMargin),
            publicPrice: Number(body.publicPrice),
            category: body.category || 'Hardware',
            isPublic: Boolean(body.isPublic),
        };

        db.push(newItem);
        await saveDatabase(db);

        return NextResponse.json({ success: true, data: newItem }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Gagal menambah data' }, { status: 500 });
    }
}

// Delete: Hapus produk berdasarkan ID
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        let db = await getRawDatabase();
        db = db.filter((item) => item.id !== id);
        await saveDatabase(db);

        return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Gagal menghapus data' }, { status: 500 });
    }
}