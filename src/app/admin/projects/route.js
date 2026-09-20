// src/app/api/admin/projects/route.js
import { NextResponse } from "next/server";

export async function GET() {
    const mockProjects = [
        {
            id: "PRJ-001",
            name: "PLTS Rooftop Cikarang Industrial",
            capacity: "500 kWp",
            status: "In Progress",
            client: "PT Industri Makmur",
            sCurve: {
                months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
                planned: [10, 25, 45, 70, 90, 100],
                actual: [8, 20, 40, 65, 82, 95],
            },
        },
        {
            id: "PRJ-002",
            name: "PLTS Ground-Mounted Subang",
            capacity: "2.5 MWp",
            status: "Planning",
            client: "PT Energi Bersama",
            sCurve: {
                months: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
                planned: [5, 15, 30, 50, 75, 100],
                actual: [5, 12, 28, 45, 60, 80],
            },
        },
    ];

    return NextResponse.json(mockProjects);
}