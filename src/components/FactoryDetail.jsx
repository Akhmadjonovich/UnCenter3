// src/components/FactoryDetail.jsx
import React, { useEffect, useState } from "react";
import { ref, onValue, update, push, set } from "firebase/database";
import { db } from "../firebase";
import Loading from "../pages/Loading";

const FactoryDetail = ({ factoryId }) => {
  const [factory, setFactory] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");

  // 🔹 Zavod ma'lumotini olish
  useEffect(() => {
    if (!factoryId) return;
    const factoryRef = ref(db, `factories/${factoryId}`);
    const unsubscribe = onValue(factoryRef, (snapshot) => {
      setFactory(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [factoryId]);

  // 🔹 Zavoddan sotib olingan maxsulotlar
  useEffect(() => {
    if (!factoryId) return;
    const purchasesRef = ref(db, `purchases/${factoryId}`);
    const unsubscribe = onValue(purchasesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setPurchases(loaded);
      } else {
        setPurchases([]);
      }
    });

    return () => unsubscribe();
  }, [factoryId]);

  // 🔹 Qarzni to'lash
  const handlePayDebt = () => {
    if (!payAmount || !factory) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return alert("To'g'ri summa kiriting");

    const newDebt = Math.max((factory.debt || 0) - amount, 0);
    update(ref(db, `factories/${factoryId}`), { debt: newDebt });
    setPayAmount("");
    alert(`Qarz yangilandi. Yangi qarz: ${newDebt}`);
  };

  if (loading) return <Loading />;

  if (!factory) return <p className="text-center mt-10">Zavod topilmadi</p>;

  return (
    <div className="p-5 max-w-6xl mx-auto">
      {/* 🔹 Zavod ma'lumotlari */}
      <div className="bg-white p-5 rounded-lg shadow-lg mb-5">
        <h2 className="text-2xl font-bold mb-3">{factory.name}</h2>
        <p><strong>Telefon:</strong> {factory.phone || "-"}</p>
        <p><strong>Manzil:</strong> {factory.address || "-"}</p>
        <p><strong>Joriy qarz:</strong> {factory.debt?.toLocaleString() || 0} so'm</p>

        <div className="mt-3 flex gap-3 items-center">
          <input
            type="number"
            placeholder="To‘lanadigan summa"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={handlePayDebt}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Qarz to‘lash
          </button>
        </div>
      </div>

      {/* 🔹 Sotib olingan maxsulotlar */}
      <div className="bg-white p-5 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-3">Sotib olingan maxsulotlar</h3>
        {purchases.length === 0 ? (
          <p className="text-gray-500 italic">Hozircha ma’lumot yo‘q...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="py-2 px-4 text-left">Nomi</th>
                <th className="py-2 px-4 text-left">Turi</th>
                <th className="py-2 px-4 text-left">Narxi</th>
                <th className="py-2 px-4 text-left">Miqdori</th>
                <th className="py-2 px-4 text-left">Birlik</th>
                <th className="py-2 px-4 text-left">Jami summa</th>
                <th className="py-2 px-4 text-left">Sana</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y divide-gray-200">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-purple-50 transition">
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4">{p.type}</td>
                  <td className="py-2 px-4">{p.price.toLocaleString()}</td>
                  <td className="py-2 px-4">{p.quantity}</td>
                  <td className="py-2 px-4">{p.unit}</td>
                  <td className="py-2 px-4 font-semibold">{(p.price * p.quantity).toLocaleString()}</td>
                  <td className="py-2 px-4">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FactoryDetail;
