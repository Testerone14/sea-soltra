import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Memastikan API menggunakan Node.js Runtime (bukan Edge Runtime)
export const runtime = "nodejs";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "File PDF tidak ditemukan dalam request." },
                { status: 400 }
            );
        }

        // Mengonversi file blob/file ke Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Memproses ekstraksi teks PDF
        const pdfData = await pdfParse(buffer);

        return NextResponse.json({
            success: true,
            text: pdfData.text,
            numpages: pdfData.numpages,
        });
    } catch (error) {
        console.error("Error parsing PDF:", error);
        return NextResponse.json(
            { error: "Gagal memproses file PDF.", details: error.message },
            { status: 500 }
        );
    }
}