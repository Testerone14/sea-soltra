// src/app/admin/page.js
"use client";

import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// ==========================================
// KOMPONEN: MS PROJECT / PRIMAVERA STYLE S-CURVE MANAGER
// ==========================================
function SCurveSectionManager({ project, onUpdateSCurve }) {
  const [activeTab, setActiveTab] = useState("overall");

  // State Input ala MS Project (Tracking Table)
  const [inputDay, setInputDay] = useState("");
  const [inputWeight, setInputWeight] = useState(""); // Bobot Pekerjaan / Cost Weight (%)
  const [inputPlanned, setInputPlanned] = useState(""); // Planned % Complete (PV)
  const [inputActual, setInputActual] = useState(""); // Physical % Complete (EV)

  // State Input Milestone
  const [milestoneName, setMilestoneName] = useState("");
  const [milestoneDay, setMilestoneDay] = useState("");

  const currentSectionData = project?.sections?.[activeTab] || {
    days: [15, 30, 45, 60],
    weights: [10, 20, 30, 40],
    planned: [10, 30, 60, 100],
    actual: [8, 25, 55, 90],
    milestones: [{ name: "Project Kickoff", day: 15 }],
  };

  // Kalkulasi Data Chart & Earned Value / Variance
  const chartData = currentSectionData.days.map((day, index) => {
    const planned = currentSectionData.planned[index] || 0;
    const actual = currentSectionData.actual[index] || 0;
    const variance = Number((actual - planned).toFixed(2)); // SV (Schedule Variance) proxy
    const periodWeight = currentSectionData.weights[index] || 0;

    return {
      name: `Day ${day}`,
      dayNum: day,
      PeriodWeight: periodWeight,
      PlannedValue: planned, // Kurva Rencana (BCWS)
      EarnedValue: actual,   // Kurva Aktual (BCWP)
      Variance: variance,
    };
  });

  // Evaluasi Kinerja Otomatis (Performance Status)
  const latestIndex = chartData.length - 1;
  const latestVariance = latestIndex >= 0 ? chartData[latestIndex].Variance : 0;

  let scheduleStatus = { text: "On Track", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" };
  if (latestVariance > 2) {
    scheduleStatus = { text: "🟢 Ahead of Schedule", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
  } else if (latestVariance < -2) {
    scheduleStatus = { text: "🔴 Behind Schedule (Delayed)", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
  }

  // Handler Simpan Progress Tracker (Mirip Update Task di MS Project)
  const handleAddProgressData = (e) => {
    e.preventDefault();
    if (!inputDay || inputWeight === "" || inputPlanned === "" || inputActual === "") return;

    const newDays = [...currentSectionData.days, Number(inputDay)];
    const newWeights = [...currentSectionData.weights, Number(inputWeight)];
    const newPlanned = [...currentSectionData.planned, Number(inputPlanned)];
    const newActual = [...currentSectionData.actual, Number(inputActual)];

    // Urutkan kronologis berdasarkan hari
    const combined = newDays.map((d, i) => ({
      d,
      w: newWeights[i],
      p: newPlanned[i],
      a: newActual[i],
    })).sort((x, y) => x.d - y.d);

    onUpdateSCurve(project.id, activeTab, {
      ...currentSectionData,
      days: combined.map((item) => item.d),
      weights: combined.map((item) => item.w),
      planned: combined.map((item) => item.p),
      actual: combined.map((item) => item.a),
    });

    setInputDay("");
    setInputWeight("");
    setInputPlanned("");
    setInputActual("");
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!milestoneName || !milestoneDay) return;

    const newMilestones = [
      ...(currentSectionData.milestones || []),
      { name: milestoneName, day: Number(milestoneDay) },
    ].sort((a, b) => a.day - b.day);

    onUpdateSCurve(project.id, activeTab, {
      ...currentSectionData,
      milestones: newMilestones,
    });

    setMilestoneName("");
    setMilestoneDay("");
  };

  const sectionTitles = {
    overall: "📊 Kurva S Keseluruhan (Overall Project - EVM Integrated)",
    planning: "📐 Engineering & Design (Tahap Perencanaan)",
    preparation: "🏗️ Procurement & Delivery (Tahap Persiapan)",
    execution: "⚡ Construction, T&C, BAST (Tahap Pelaksanaan)",
  };

  return (
    <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md space-y-6">

      {/* TAB WBS / SEKSI PROYEK */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {[
          { key: "overall", label: "Keseluruhan (Overall)" },
          { key: "planning", label: "1. Engineering" },
          { key: "preparation", label: "2. Procurement" },
          { key: "execution", label: "3. Construction & BAST" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
              : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* HEADER & INDIKATOR KINERJA EVM */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{sectionTitles[activeTab]}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Project Baseline Lokasi: <span className="text-sky-400 font-semibold">{project?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-lg border text-xs font-bold ${scheduleStatus.color}`}>
            Schedule Variance (SV): {latestVariance > 0 ? `+${latestVariance}%` : `${latestVariance}%`} ({scheduleStatus.text})
          </div>
        </div>
      </div>

      {/* GRAFIK KOMBINASI BAR (Periodic Weight) & LINE (Cumulative S-Curve PV vs EV) */}
      <div className="w-full h-80 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
            <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickLine={false} unit="%" />
            <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={12} domain={[0, 50]} tickLine={false} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#334155",
                borderRadius: "10px",
                color: "#f8fafc",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
            <Bar yAxisId="right" dataKey="PeriodWeight" fill="#f59e0b" opacity={0.5} name="Bobot Periodik (%)" />
            <Line yAxisId="left" type="monotone" dataKey="PlannedValue" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Planned Value / PV (Rencana)" />
            <Line yAxisId="left" type="monotone" dataKey="EarnedValue" stroke="#10b981" strokeWidth={3} name="Earned Value / EV (Realisasi)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* DAFTAR MILESTONE */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mr-2">🚩 Milestone Jadwal:</span>
        {currentSectionData.milestones && currentSectionData.milestones.length > 0 ? (
          currentSectionData.milestones.map((m, idx) => (
            <span key={idx} className="bg-slate-800 text-slate-200 text-xs px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <span className="text-sky-400 font-semibold">Day {m.day}:</span> {m.name}
            </span>
          ))
        ) : (
          <span className="text-xs text-slate-500 italic">Belum ada milestone pada seksi ini.</span>
        )}
      </div>

      {/* FORM INPUT ALUR MS PROJECT (TRACKING TABLE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Form Update Progress Harian */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            📝 Update Task Progress (Time-Phased Tracking)
          </h4>
          <form onSubmit={handleAddProgressData} className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Durasi Hari Ke-</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 30"
                value={inputDay}
                onChange={(e) => setInputDay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Bobot Pekerjaan (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                placeholder="Contoh: 20"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Planned % (PV)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                placeholder="Contoh: 45"
                value={inputPlanned}
                onChange={(e) => setInputPlanned(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Physical % (EV)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                placeholder="Contoh: 40"
                value={inputActual}
                onChange={(e) => setInputActual(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div className="col-span-2 pt-1">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition shadow-md shadow-emerald-600/20"
              >
                Simpan & Rekonsiliasi Baseline
              </button>
            </div>
          </form>
        </div>

        {/* Form Tambah Milestone */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            🚩 Tambah Milestone Jadwal ({activeTab.toUpperCase()})
          </h4>
          <form onSubmit={handleAddMilestone} className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nama Milestone</label>
              <input
                type="text"
                required
                placeholder="Contoh: Approval DED / PVSyst"
                value={milestoneName}
                onChange={(e) => setMilestoneName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Target Hari Ke-</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Contoh: 30"
                value={milestoneDay}
                onChange={(e) => setMilestoneDay(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition shadow-md shadow-amber-600/20"
            >
              Tambah Titik Milestone
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// DATA DUMMY AWAL PROYEK (Berdasarkan Konteks PLTS)
// ==========================================
const initialProjects = [
  {
    id: "PRJ-001",
    name: "PLTS Hybrid Pegangsaan Dua",
    region: "DKI Jakarta",
    capacity: "5.5 kWp",
    status: "Running",
    client: "Residensial",
    value: "IDR 125 Juta",
    sections: {
      planning: {
        days: [5, 10, 15],
        weights: [30, 40, 30],
        planned: [30, 70, 100],
        actual: [30, 75, 100],
        milestones: [{ name: "Approval DED & BoQ", day: 10 }],
      },
      preparation: {
        days: [15, 20, 25],
        weights: [20, 50, 30],
        planned: [20, 70, 100],
        actual: [20, 65, 95],
        milestones: [{ name: "Material On Site (MOS)", day: 25 }],
      },
      execution: {
        days: [25, 30, 35, 45],
        weights: [15, 35, 35, 15],
        planned: [15, 50, 85, 100],
        actual: [15, 48, 80, 90],
        milestones: [
          { name: "Testing & Commissioning", day: 35 },
          { name: "BAST & Warranty Handover", day: 45 }
        ],
      },
      overall: {
        days: [],
        weights: [],
        planned: [],
        actual: [],
        milestones: [],
      },
    },
  },
  {
    id: "PRJ-002",
    name: "PLTS Off-Grid Sumba",
    region: "Nusa Tenggara Timur",
    capacity: "17.28 kWp / 80 kWh",
    status: "Preparation",
    client: "Utilitas Lokal",
    value: "IDR 850 Juta",
    sections: {
      planning: {
        days: [15, 30, 45],
        weights: [40, 40, 20],
        planned: [40, 80, 100],
        actual: [35, 75, 90],
        milestones: [{ name: "Finalisasi PVSyst Loss Flow", day: 30 }],
      },
      preparation: {
        days: [45, 60, 75],
        weights: [30, 40, 30],
        planned: [30, 70, 100],
        actual: [20, 50, 70],
        milestones: [{ name: "Pengiriman Inverter & Baterai LiFePO4", day: 60 }],
      },
      execution: {
        days: [75, 90, 105, 120],
        weights: [20, 30, 30, 20],
        planned: [20, 50, 80, 100],
        actual: [0, 0, 0, 0],
        milestones: [{ name: "Mechanical Completion", day: 90 }],
      },
      overall: {
        days: [],
        weights: [],
        planned: [],
        actual: [],
        milestones: [],
      },
    },
  },
  {
    id: "PRJ-003",
    name: "PLTS Rooftop East Jakarta",
    region: "DKI Jakarta",
    capacity: "7.5 kWp / 10 kWh",
    status: "Preparation",
    client: "Residensial",
    value: "IDR 150 Juta",
    sections: {
      planning: {
        days: [10, 20],
        weights: [50, 50],
        planned: [50, 100],
        actual: [45, 90],
        milestones: [{ name: "Persetujuan K3 & HIRADC", day: 15 }],
      },
      preparation: {
        days: [20, 30],
        weights: [50, 50],
        planned: [50, 100],
        actual: [40, 70],
        milestones: [{ name: "Material Tiba di Lokasi", day: 30 }],
      },
      execution: {
        days: [30, 40, 50],
        weights: [30, 40, 30],
        planned: [30, 70, 100],
        actual: [0, 0, 0],
        milestones: [{ name: "Testing Inverter", day: 40 }],
      },
      overall: {
        days: [],
        weights: [],
        planned: [],
        actual: [],
        milestones: [],
      },
    },
  }
];

// ==========================================
// HALAMAN UTAMA ADMIN DASHBOARD
// ==========================================
export default function AdminDashboard() {
  const [projectsList, setProjectsList] = useState(initialProjects);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjects[0].id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    region: "DKI Jakarta",
    capacity: "",
    status: "Preparation",
    client: "",
    value: "",
  });

  const filteredProjects =
    selectedRegion === "All"
      ? projectsList
      : projectsList.filter((p) => p.region === selectedRegion);

  const activeProject =
    projectsList.find((p) => p.id === selectedProjectId) || filteredProjects[0] || projectsList[0];

  // ==========================================
  // KALKULASI AUTOMATIS SEKSI KESELURUHAN (OVERALL) ALA MS PROJECT
  // Mengambil rata-rata dari seksi Planning, Preparation, & Execution
  // ==========================================
  if (activeProject && activeProject.sections) {
    const pSec = activeProject.sections.planning || { days: [], planned: [], actual: [], weights: [] };
    const prepSec = activeProject.sections.preparation || { days: [], planned: [], actual: [], weights: [] };
    const eSec = activeProject.sections.execution || { days: [], planned: [], actual: [], weights: [] };

    const allDaysSet = new Set([...pSec.days, ...prepSec.days, ...eSec.days]);
    const sortedDays = Array.from(allDaysSet).sort((a, b) => a - b);

    if (sortedDays.length > 0) {
      const avgPlanned = sortedDays.map((d) => {
        const valP = pSec.days.includes(d) ? pSec.planned[pSec.days.indexOf(d)] : 0;
        const valPrep = prepSec.days.includes(d) ? prepSec.planned[prepSec.days.indexOf(d)] : 0;
        const valE = eSec.days.includes(d) ? eSec.planned[eSec.days.indexOf(d)] : 0;
        return Number(((valP + valPrep + valE) / 3).toFixed(2));
      });

      const avgActual = sortedDays.map((d) => {
        const valP = pSec.days.includes(d) ? pSec.actual[pSec.days.indexOf(d)] : 0;
        const valPrep = prepSec.days.includes(d) ? prepSec.actual[prepSec.days.indexOf(d)] : 0;
        const valE = eSec.days.includes(d) ? eSec.actual[eSec.days.indexOf(d)] : 0;
        return Number(((valP + valPrep + valE) / 3).toFixed(2));
      });

      const avgWeights = sortedDays.map((d) => {
        const valP = pSec.days.includes(d) ? pSec.weights[pSec.days.indexOf(d)] : 0;
        const valPrep = prepSec.days.includes(d) ? prepSec.weights[prepSec.days.indexOf(d)] : 0;
        const valE = eSec.days.includes(d) ? eSec.weights[eSec.days.indexOf(d)] : 0;
        return Number(((valP + valPrep + valE) / 3).toFixed(2));
      });

      const combinedMilestones = [
        ...(pSec.milestones || []),
        ...(prepSec.milestones || []),
        ...(eSec.milestones || []),
      ].sort((a, b) => a.day - b.day);

      activeProject.sections.overall = {
        days: sortedDays,
        weights: avgWeights,
        planned: avgPlanned,
        actual: avgActual,
        milestones: combinedMilestones,
      };
    }
  }

  const totalContracts = filteredProjects.length;
  const runningContracts = filteredProjects.filter((p) => p.status === "Running").length;
  const prepContracts = filteredProjects.filter((p) => p.status === "Preparation").length;

  const handleUpdateSCurve = (projectId, sectionKey, newSectionData) => {
    const updated = projectsList.map((proj) => {
      if (proj.id === projectId) {
        return {
          ...proj,
          sections: {
            ...proj.sections,
            [sectionKey]: newSectionData,
          },
        };
      }
      return proj;
    });
    setProjectsList(updated);
  };

  const handleAddProjectSubmit = (e) => {
    e.preventDefault();
    const projectToAdd = {
      id: `PRJ-00${projectsList.length + 1}`,
      ...newProject,
      sections: {
        planning: { days: [15], weights: [100], planned: [100], actual: [90], milestones: [{ name: "Inisiasi Desain", day: 15 }] },
        preparation: { days: [30], weights: [100], planned: [100], actual: [80], milestones: [{ name: "Permit to Work (PTW) Approved", day: 30 }] },
        execution: { days: [60], weights: [100], planned: [100], actual: [70], milestones: [{ name: "Konstruksi & BAST", day: 60 }] },
        overall: { days: [], weights: [], planned: [], actual: [], milestones: [] },
      },
    };
    setProjectsList([...projectsList, projectToAdd]);
    setSelectedProjectId(projectToAdd.id);
    setIsAddModalOpen(false);
    setNewProject({
      name: "",
      region: "DKI Jakarta",
      capacity: "",
      status: "Preparation",
      client: "",
      value: "",
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">EPCC Control Tower - Solar PV Tracking</h1>
            <p className="text-sm text-slate-400">Manajemen Baseline Hari, Planned Value (PV), Earned Value (EV), & Rekonsiliasi Kurva S</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900">🌐 Semua Region</option>
                <option value="DKI Jakarta" className="bg-slate-900">📍 DKI Jakarta</option>
                <option value="Jawa Barat" className="bg-slate-900">📍 Jawa Barat</option>
                <option value="Nusa Tenggara Timur" className="bg-slate-900">📍 Nusa Tenggara Timur</option>
              </select>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-lg shadow-sky-600/20 flex items-center gap-2 ml-auto"
            >
              <span>+ Tambah Proyek Baru</span>
            </button>
          </div>
        </div>

        {/* METRIK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kontrak</span>
              <h2 className="text-3xl font-black text-white mt-1">{totalContracts}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-xl font-bold">📂</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Running Construction</span>
              <h2 className="text-3xl font-black text-emerald-400 mt-1">{runningContracts}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">⚡</div>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-lg flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preparation / Engineering</span>
              <h2 className="text-3xl font-black text-amber-400 mt-1">{prepContracts}</h2>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-bold">⏳</div>
          </div>
        </div>

        {/* PANEL UTAMA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-white">Navigasi Proyek PLTS</h2>
                <p className="text-xs text-slate-400">Pilih proyek untuk memantau status instalasi</p>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Pilih Proyek:</label>
                <select
                  value={activeProject?.id || ""}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-sky-500"
                >
                  {filteredProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              {activeProject && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Region:</span>
                    <span className="text-white font-semibold">{activeProject.region}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Kapasitas Sistem:</span>
                    <span className="text-white font-semibold">{activeProject.capacity}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Nilai Kontrak:</span>
                    <span className="text-emerald-400 font-semibold">{activeProject.value}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Segmen Klien:</span>
                    <span className="text-slate-200 font-medium">{activeProject.client}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeProject && (
              <SCurveSectionManager
                project={activeProject}
                onUpdateSCurve={handleUpdateSCurve}
              />
            )}
          </div>
        </div>

        {/* MODAL TAMBAH PROYEK */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Pendaftaran Proyek Baru</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white text-lg font-bold">✕</button>
              </div>

              <form onSubmit={handleAddProjectSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Nama Proyek</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PLTS Cikarang"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Region</label>
                    <select
                      value={newProject.region}
                      onChange={(e) => setNewProject({ ...newProject, region: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                    >
                      <option value="DKI Jakarta">DKI Jakarta</option>
                      <option value="Jawa Barat">Jawa Barat</option>
                      <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Kapasitas PV / Inverter</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 1 MWp / 800 kW"
                      value={newProject.capacity}
                      onChange={(e) => setNewProject({ ...newProject, capacity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Status Awal</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                    >
                      <option value="Preparation">Preparation / Engineering</option>
                      <option value="Running">Running / Konstruksi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Nilai Kontrak</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: IDR 15 Miliar"
                      value={newProject.value}
                      onChange={(e) => setNewProject({ ...newProject, value: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Segmen Klien</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: C&I (Commercial & Industrial)"
                    value={newProject.client}
                    onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-xl">Batal</button>
                  <button type="submit" className="bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-xl">Simpan Proyek</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}