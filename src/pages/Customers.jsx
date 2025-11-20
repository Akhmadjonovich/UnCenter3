// src/pages/Customers.jsx
import { useState, useEffect } from "react";
import { ref, onValue, push, update } from "firebase/database";
import { db } from "../firebase";
import { useParams, Link } from "react-router-dom";
import Loading from "./Loading";

export default function CustomersPage() {
  const [customers, setCustomers] = useState({});
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customersRef = ref(db, "customers");
    onValue(customersRef, (snap) => {
      setCustomers(snap.val() || {});
      setLoading(false);
    });
  }, []);

  const filteredCustomers = Object.entries(customers).filter(([id, c]) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;
  
  return (
    <div className="p-6 max-sm:p-2 mt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mijozlar</h1>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Yangi Mijoz
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Mijozni qidirish..."
          className="w-full p-2 border rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(([id, c]) => (
          <Link
            key={id}
            to={`/customer/${id}`}
            className="p-4 bg-white shadow rounded hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold">{c.name}</h2>
            <p className="text-gray-600">📞 {c.phone || "-"}</p>
            <p className="text-gray-600">📍 {c.location || "-"}</p>
            <p className="text-red-600 font-bold mt-2">
              Qarz: {c.debt?.toLocaleString() || 0} so'm
            </p>
          </Link>
        ))}
      </div>

      {open && <AddCustomerModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function AddCustomerModal({ onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const addCustomer = () => {
    if (!name) {
      alert("Mijoz nomini kiriting");
      return;
    }

    push(ref(db, "customers"), {
      name,
      phone,
      location,
      debt: 0,
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-md rounded shadow">
        <h2 className="text-xl font-bold mb-4">Yangi Mijoz Qo'shish</h2>

        <input
          placeholder="Mijoz ismi"
          className="w-full p-2 border rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Telefon"
          className="w-full p-2 border rounded mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          placeholder="Qayerdan"
          className="w-full p-2 border rounded mb-3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Bekor qilish
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={addCustomer}
          >
            Qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================
// Customer Detail page
// =====================================
export function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState({});
  const [payments, setPayments] = useState({});
  const [pay, setPay] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const customerRef = ref(db, `customers/${id}`);
    const unsubscribeCustomer = onValue(customerRef, (snap) => {
      setCustomer(snap.val());
      setLoading(false);
    });

    const salesRef = ref(db, "customerPurchases");
    const unsubscribeSales = onValue(salesRef, (snap) => {
      const all = snap.val() || {};
      const filtered = {};
      Object.entries(all).forEach(([sid, s]) => {
        if (s.customerId === id) filtered[sid] = s;
      });
      setSales(filtered);
    });

    const paymentsRef = ref(db, "customerPayments");
    const unsubscribePayments = onValue(paymentsRef, (snap) => {
      const all = snap.val() || {};
      const filtered = {};
      Object.entries(all).forEach(([pid, p]) => {
        if (p.customerId === id) filtered[pid] = p;
      });
      setPayments(filtered);
    });

    return () => {
      unsubscribeCustomer();
      unsubscribeSales();
      unsubscribePayments();
    };
  }, [id]);

  const payDebt = (all = false) => {
    if (!customer) return;
    const payAmount = all ? customer.debt : Number(pay);
    if (!payAmount || payAmount <= 0) return alert("To‘lov summasini kiriting");

    const newDebt = Math.max((customer.debt || 0) - payAmount, 0);
    update(ref(db, `customers/${id}`), { debt: newDebt });

    push(ref(db, "customerPayments"), {
      customerId: id,
      amount: payAmount,
      note: all ? "To‘liq to‘lov" : "Qisman to‘lov",
      date: Date.now(),
    });

    setPay("");
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4 mt-16 flex flex-col md:flex-row gap-6">
      {/* 🔹 Left: Customer info + pay + payment history */}
      <div className="flex-1 space-y-4">
        <div className="bg-white shadow rounded p-4 space-y-4">
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p>📞 {customer.phone || "-"}</p>
          <p>📍 {customer.location || "-"}</p>
          <p className="text-red-600 font-bold text-xl">
            Qarz: {customer.debt?.toLocaleString() || 0} so‘m
          </p>
        </div>

        <div className="bg-white shadow rounded p-4 space-y-2">
          <h2 className="text-lg font-semibold">Qarz to‘lash</h2>
          <input
            type="number"
            placeholder="To'lanadigan summa"
            className="w-full p-2 border rounded"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
          />
          <div className="flex gap-3 mt-2">
            <button className="flex-1 py-2 bg-green-600 text-white rounded" onClick={() => payDebt(false)}>To‘lash</button>
            <button className="flex-1 py-2 bg-blue-600 text-white rounded" onClick={() => payDebt(true)}>Hammasini to‘lash</button>
          </div>
        </div>

        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">To‘lovlar tarixi</h2>
          {Object.entries(payments).length === 0 && <p>Hali to‘lov yo‘q</p>}
          {Object.entries(payments).map(([pid, p]) => (
            <div key={pid} className="border-b py-2">
              <p>Summasi: {p.amount.toLocaleString()} so‘m</p>
              <p>Holat: {p.note}</p>
              <p className="text-gray-500 text-sm">{new Date(p.date).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Right: Sales history */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Savdo tarixi</h2>
          {Object.entries(sales).length === 0 && <p>Hali hech narsa sotilmagan</p>}

          {Object.entries(sales).map(([sid, s]) => (
            <div key={sid} className="border rounded mb-4 p-3">
              <p className="font-semibold text-blue-600 mb-2">
                Xarid vaqti: {new Date(s.date).toLocaleString()} | 
                Jami: {s.totalPrice?.toLocaleString()} so'm | 
                To‘langan: {s.paid?.toLocaleString()} so'm | 
                Qarz: {s.debtLeft?.toLocaleString()} so'm
              </p>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Mahsulot</th>
                    <th className="border px-2 py-1">Turi</th>
                    <th className="border px-2 py-1">Narxi</th>
                    <th className="border px-2 py-1">Miqdori</th>
                    <th className="border px-2 py-1">Umumiy narxi</th>
                  </tr>
                </thead>
                <tbody>
                  {s.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{item.productName}</td>
                      <td className="border px-2 py-1">{item.productType}</td>
                      <td className="border px-2 py-1">{item.price.toLocaleString()}</td>
                      <td className="border px-2 py-1">{item.amount} {item.amountType}</td>
                      <td className="border px-2 py-1">{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
