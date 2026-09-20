import { NextResponse } from "next/server";

// Mengembalikan data JSON secara valid untuk Control Tower EPCC
export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            metrics: {
                totalProjects: 12,
                evmProgress: "+4.2% On-Track",
                pendingRFQ: 8,
                hseSafeHours: "142,500 hrs",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Gagal mengambil data metrik" },
            { status: 500 }
        );
    }
}