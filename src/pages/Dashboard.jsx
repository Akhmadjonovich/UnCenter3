// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { FcMoneyTransfer } from "react-icons/fc";
import { FaUsers, FaIndustry } from "react-icons/fa";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { MdOutlineAddBusiness } from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [factories, setFactories] = useState({});
  const [customers, setCustomers] = useState({});
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const categories = ["Barchasi", "Un", "Yog'", "Tuz", "Novvoylar maxsuloti"];

  const [currency, setCurrency] = useState("UZS");
  const [usdRate, setUsdRate] = useState(0);

  useEffect(() => {
    fetch("https://api.exchangerate.host/latest?base=USD&symbols=UZS")
      .then((res) => res.json())
      .then((data) => data?.rates?.UZS && setUsdRate(data.rates.UZS))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const productsRef = ref(db, "products");
    const factoriesRef = ref(db, "factories");
    const customersRef = ref(db, "customers");

    onValue(productsRef, (snap) => {
      const data = snap.val();
      setProducts(data ? Object.entries(data).map(([id, p]) => ({ id, ...p })) : []);
      setLoading(false);
    });

    onValue(factoriesRef, (snap) => setFactories(snap.val() || {}));

    onValue(customersRef, (snap) => setCustomers(snap.val() || {}));
  }, []);

  const filteredProducts =
    activeCategory === "Barchasi"
      ? products
      : products.filter((p) =>
          activeCategory === "Novvoylar maxsuloti"
            ? p.type === "Novvoylar maxsuloti"
            : p.type === activeCategory
        );

  const totalProfit = filteredProducts.reduce(
    (sum, p) => sum + (p.price - (p.buyPrice || 0)) * (p.quantity || 0),
    0
  );

  const totalDebt = Object.values(factories).reduce(
    (sum, f) => sum + (f.debt || 0),
    0
  );

  const convert = (amount) =>
    currency === "USD" ? (usdRate > 0 ? (amount / usdRate).toFixed(2) : 0) : amount.toLocaleString();

  if (loading) return <Loading />;

  return (
    <div className="p-4 max-sm:p-2 mt-16 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-4">
        <div
          className="flex items-center gap-4 bg-white p-4 rounded shadow cursor-pointer"
          onClick={() => navigate("/revenue-details")}
        >
          <FcMoneyTransfer className="text-6xl p-2 rounded bg-purple-100" />
          <div>
            <h3 className="text-gray-500 font-semibold">Umumiy daromad</h3>
            <h2 className="text-xl font-bold">
              {convert(totalProfit)} {currency}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded shadow">
          <FaUsers className="text-6xl p-2 rounded bg-blue-100 text-blue-700" />
          <div>
            <h3 className="text-gray-500 font-semibold">Mijozlar</h3>
            <h2 className="text-xl font-bold">{Object.keys(customers).length}</h2>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded shadow">
          <MdOutlineAddBusiness className="text-6xl p-2 rounded bg-green-100 text-green-700" />
          <div>
            <h3 className="text-gray-500 font-semibold">Zavodlar / Umumiy qarz</h3>
            <h2 className="text-xl font-bold">
              {Object.keys(factories).length} / {convert(totalDebt)} {currency}
            </h2>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded shadow">
        {categories.map((c) => (
          <button
            key={c}
            className={`px-4 py-2 rounded-full font-semibold ${
              activeCategory === c
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-blue-100"
            }`}
            onClick={() => setActiveCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products table */}
      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="w-full border-collapse text-gray-700">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
            <tr>
              <th className="py-2 px-3">Mahsulot</th>
              <th className="py-2 px-3">Turi</th>
              <th className="py-2 px-3">Sotish narxi</th>
              <th className="py-2 px-3">Miqdor</th>
              <th className="py-2 px-3">Umumiy foyda</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-5 text-center text-gray-500 italic">
                  Hozircha ma’lumot yo‘q...
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-purple-50">
                  <td className="py-2 px-3 font-medium">{p.name}</td>
                  <td className="py-2 px-3 text-center">{p.type}</td>
                  <td className="py-2 px-3 font-semibold text-center">{convert(p.price)} {currency}</td>
                  <td className="py-2 px-3 text-center">{p.quantity}</td>
                  <td className="py-2 px-3 font-semibold ">{convert((p.price - (p.buyPrice || 0)) * p.quantity)} {currency}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
