import fs from "fs";
import path from "path";

// Menentukan jalur file data.json secara absolut
const dataFilePath = path.join(process.cwd(), "src", "lib", "data.json");

// Fungsi helper untuk membaca data
export function getData() {
  try {
    const jsonData = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Gagal membaca file data.json:", error);
    return [];
  }
}

// Fungsi helper untuk menulis/memperbarui data
export function saveData(newData) {
  try {
    // Catatan: Operasi ini bekerja di lokal/server dedicated.
    // Jika di-deploy ke Vercel, pertimbangkan menggunakan database eksternal (misal: Supabase / PostgreSQL).
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), "utf8");
    return { success: true };
  } catch (error) {
    console.error("Gagal menyimpan ke data.json:", error);
    return { success: false, error: error.message };
  }
}