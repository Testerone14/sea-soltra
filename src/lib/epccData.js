// src/lib/epccData.js
export const epccDatabase = {
    projects: [
        {
            id: "PRJ-001",
            name: "Refinery Unit Expansion Phase II",
            client: "Pertamina Hulu",
            pendingRFQ: 5,
            hseSafeHours: "85,400 hrs",
            sCurveData: {
                months: ["Bulan 1", "Bulan 2", "Bulan 3", "Bulan 4", "Bulan 5"],
                planned: [10, 25, 50, 75, 100],
                actual: [12, 28, 48, 70, 88], // Menghasilkan kalkulasi varians
            },
            evmMetrics: {
                cpi: 1.05, // Cost Performance Index (>1 efisien)
                spi: 0.98, // Schedule Performance Index
                bac: "$12,400,000",
                ev: "$11,800,000",
            }
        },
        {
            id: "PRJ-002",
            name: "Offshore Pipeline Installation",
            client: "Medco Energi",
            pendingRFQ: 3,
            hseSafeHours: "57,100 hrs",
            sCurveData: {
                months: ["Bulan 1", "Bulan 2", "Bulan 3", "Bulan 4"],
                planned: [15, 40, 70, 100],
                actual: [18, 45, 78, 95],
            },
            evmMetrics: {
                cpi: 0.95,
                spi: 1.04,
                bac: "$8,900,000",
                ev: "$9,100,000",
            }
        }
    ]
};