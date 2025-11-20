import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const RevenueDetails = () => {
  const [products, setProducts] = useState([]);
  const [factories, setFactories] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr",
  ];

  const years = [2023, 2024, 2025, 2026]; // kerak bo‘lsa dinamik qilsa bo‘ladi

  useEffect(() => {
    onValue(ref(db, "products"), (snap) => {
      const data = snap.val();
      setProducts(data ? Object.entries(data).map(([id, p]) => ({ id, ...p })) : []);
    });
    onValue(ref(db, "factories"), (snap) => setFactories(snap.val() || {}));
  }, []);

  // 🔹 Har oy uchun data
  const monthlyData = months.map((m, idx) => {
    const monthProducts = products.filter((p) => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      return date.getMonth() === idx && date.getFullYear() === selectedYear;
    });

    const profit = monthProducts.reduce(
      (sum, p) => sum + ((p.price || 0) - (p.buyPrice || 0)) * (p.quantity || 0),
      0
    );

    const totalDebt = Object.values(factories).reduce((sum, f) => sum + (f.debt || 0), 0);

    const totalIncome = monthProducts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 0), 0);
    const totalCost = monthProducts.reduce((sum, p) => sum + (p.buyPrice || 0) * (p.quantity || 0), 0);

    return {
      month: m,
      profit,
      totalDebt,
      totalIncome,
      totalCost,
    };
  });

  // 🔹 Tanlangan oy uchun tafsilot
  const selectedMonthData = monthlyData[selectedMonth];

  return (
    <div className="p-4 max-sm:p-0 mt-16 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">Daromad tafsiloti</h1>

      {/* 🔹 Line chart */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Oylar bo‘yicha daromad</h2>
        <ResponsiveContainer width="99%" height={300}>
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis 
                tickFormatter={(val) => (val / 1_000_000).toFixed(1) + "M"} 
            />
            <Tooltip formatter={(val) => val.toLocaleString() + " so'm"} />
            <Legend />
            <Line type="monotone" dataKey="profit" stroke="#4f46e5" strokeWidth={3} name="Sof daromad" />
            <Line type="monotone" dataKey="totalDebt" stroke="#16a34a" strokeWidth={3} name="Zavod qarzi" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 Oy va yil tanlash */}
      <div className="flex gap-4 items-center">
        <label className="font-semibold">Oyni tanlang:</label>
        <select
          className="p-2 border rounded"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(+e.target.value)}
        >
          {months.map((m, idx) => (
            <option key={idx} value={idx}>{m}</option>
          ))}
        </select>

        <label className="font-semibold">Yilni tanlang:</label>
        <select
          className="p-2 border rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(+e.target.value)}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* 🔹 Tanlangan oy tafsiloti */}
      <div className="bg-white p-4 rounded shadow space-y-2">
        <h3 className="font-semibold text-lg">Tanlangan oy tafsiloti ({months[selectedMonth]} {selectedYear}):</h3>
        <p><strong>Sof daromad:</strong> {selectedMonthData.profit.toLocaleString()} so'm</p>
        <p><strong>Zavod qarzi:</strong> {selectedMonthData.totalDebt.toLocaleString()} so'm</p>
        <p><strong>Kirim:</strong> {selectedMonthData.totalIncome.toLocaleString()} so'm</p>
        <p><strong>Chiqarim:</strong> {selectedMonthData.totalCost.toLocaleString()} so'm</p>
      </div>
    </div>
  );
};

export default RevenueDetails;
