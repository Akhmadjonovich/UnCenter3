// React + Tailwind + Firebase Realtime Database
// Full factories module (PAGE + MODAL + DETAIL + DEBT FORM)

import { useState, useEffect } from "react";
import { ref, onValue, push, update } from "firebase/database";
import { db } from "../firebase";
import { useParams } from "react-router-dom";

/* ------------------------------------------------------
   PAGE: FACTORIES LIST
------------------------------------------------------ */
export function FactoriesPage() {
  const [factories, setFactories] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const factoriesRef = ref(db, "factories");
    return onValue(factoriesRef, (snap) => {
      setFactories(snap.val() || {});
    });
  }, []);

  return (
    <div className="p-6 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zavodlar</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Yangi Zavod
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(factories).map(([id, f]) => (
          <a
            key={id}
            href={`/factory/${id}`}
            className="p-4 bg-white shadow rounded hover:shadow-lg transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold">{f.name}</h2>
            <p className="text-gray-600">📞 {f.phone}</p>
            <p className="text-gray-600">📍 {f.address}</p>
            <p className="text-red-600 font-bold mt-2">
              Qarz: {f.debt?.toLocaleString()} so'm
            </p>
          </a>
        ))}
      </div>

      {open && <AddFactoryModal onClose={() => setOpen(false)} />}
    </div>
  );
}

/* ------------------------------------------------------
   MODAL: ADD FACTORY
------------------------------------------------------ */
export function AddFactoryModal({ onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const addFactory = () => {
    push(ref(db, "factories"), {
      name,
      phone,
      address,
      debt: 0,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 w-full max-w-md rounded shadow">
        <h2 className="text-xl font-bold mb-4">Yangi Zavod Qo'shish</h2>

        <input
          placeholder="Zavod nomi"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Telefon"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Manzil"
          className="w-full p-2 border rounded mb-3"
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Bekor qilish
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={addFactory}
          >
            Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------
   DETAIL PAGE: FACTORY INFO + PURCHASE HISTORY
------------------------------------------------------ */
export function FactoryDetail({ id }) {
  const [factory, setFactory] = useState(null);
  const [purchases, setPurchases] = useState({});
  const [payments, setPayments] = useState({});

  // FILTER STATES
  const [purchaseDate, setPurchaseDate] = useState("");
  const [paymentDate, setPaymentDate] = useState("");

  useEffect(() => {
    return onValue(ref(db, `factories/${id}`), (snap) => {
      setFactory(snap.val());
    });
  }, [id]);

  useEffect(() => {
    return onValue(ref(db, "factoryPurchases"), (snap) => {
      const data = snap.val() || {};
      const filtered = {};

      Object.entries(data).forEach(([pid, p]) => {
        if (p.factoryId === id) filtered[pid] = p;
      });

      setPurchases(filtered);
    });
  }, [id]);

  useEffect(() => {
    return onValue(ref(db, "factoryPayments"), (snap) => {
      const data = snap.val() || {};
      const filtered = {};

      Object.entries(data).forEach(([payId, p]) => {
        if (p.factoryId === id) filtered[payId] = p;
      });

      setPayments(filtered);
    });
  }, [id]);

  if (!factory) return <div className="p-6">Yuklanmoqda...</div>;

  // ------------- FILTER FUNCTIONS ----------------

  const filteredPurchases = Object.entries(purchases).filter(([_, p]) => {
    if (!purchaseDate) return true;
    const d = new Date(p.date);
    return d.toISOString().slice(0, 10) === purchaseDate;
  });

  const filteredPayments = Object.entries(payments).filter(([_, p]) => {
    if (!paymentDate) return true;
    const d = new Date(p.date);
    return d.toISOString().slice(0, 10) === paymentDate;
  });

  // ------------------------------------------------

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LEFT SIDE - PURCHASE HISTORY */}
      <div className="col-span-2 bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-4">📦 Sotib olingan mahsulotlar</h2>

        {/* PURCHASE FILTER */}
        <div className="mb-4">
          <label className="font-semibold mr-2">Sana bo‘yicha filter:</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Mahsulot</th>
              <th className="border p-2">Miqdor</th>
              <th className="border p-2">Narx</th>
              <th className="border p-2">To‘langan</th>
              <th className="border p-2">Qarz</th>
              <th className="border p-2">Sana</th>
            </tr>
          </thead>

          <tbody>
            {filteredPurchases.map(([pid, p]) => (
              <tr key={pid}>
                <td className="border p-2">{p.productName}</td>
                <td className="border p-2">{p.amount} {p.amountType}</td>
                <td className="border p-2">{p.price.toLocaleString()} so‘m</td>
                <td className="border p-2">{p.paid.toLocaleString()} so‘m</td>
                <td className="border p-2 text-red-600">{p.debtLeft.toLocaleString()} so‘m</td>
                <td className="border p-2 text-sm">
                  {new Date(p.date).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">

        {/* FACTORY INFO */}
        <div className="bg-white shadow rounded p-4">
          <h1 className="text-2xl font-bold">{factory.name}</h1>
          <p className="mt-2">📞 {factory.phone}</p>
          <p>📍 {factory.address}</p>

          <p className="text-red-600 font-bold text-xl mt-2">
            Qarz: {factory.debt?.toLocaleString()} so‘m
          </p>
        </div>

        {/* DEBT PAY FORM */}
        <DebtPayForm id={id} currentDebt={factory.debt} />

        {/* PAYMENT HISTORY */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-bold mb-3">💳 To‘lovlar tarixi</h2>

          {/* PAYMENT FILTER */}
          <div className="mb-4">
            <label className="font-semibold mr-2">Sana bo‘yicha filter:</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="border p-2 rounded"
            />
          </div>

          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Summa</th>
                <th className="border p-2">Sana</th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map(([payId, p]) => (
                <tr key={payId}>
                  <td className="border p-2 text-green-700 font-semibold">
                    {p.amount.toLocaleString()} so‘m
                  </td>
                  <td className="border p-2 text-sm">
                    {new Date(p.date).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <p className="text-gray-500 text-sm mt-2">Bu kunda to‘lov qilinmagan</p>
          )}
        </div>

      </div>
    </div>
  );
}


// PAYMENT FORM
export function DebtPayForm({ id, currentDebt }) {
  const [pay, setPay] = useState(0);

  const submitPay = () => {
    if (pay <= 0) return;

    // Debt subtract
    const newDebt = Math.max(currentDebt - pay, 0);
    update(ref(db, `factories/${id}`), { debt: newDebt });

    // Save payment history
    push(ref(db, "factoryPayments"), {
      factoryId: id,
      amount: pay,
      date: Date.now(),
    });

    setPay(0);
  };

  return (
    <div className="bg-white shadow rounded p-4">
      <h3 className="text-lg font-semibold mb-2">Qarz to‘lash</h3>

      <input
        type="number"
        className="p-2 border rounded w-full mb-3"
        placeholder="To‘lov summasi"
        value={pay}
        onChange={(e) => setPay(+e.target.value)}
      />

      <button
        onClick={submitPay}
        className="px-4 py-2 bg-green-600 text-white rounded w-full"
      >
        To‘lash
      </button>
    </div>
  );
}