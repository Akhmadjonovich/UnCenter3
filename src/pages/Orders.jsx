import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase"; // sening firebase.js faylingni to‘g‘ri yo‘l bilan import qil
import Loading from "./Loading";
// axios endi kerak emas

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔥 Realtime listener
    const ordersRef = ref(db, "orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, val]) => ({
          id,
          ...val,
        }));
        // so‘nggi buyurtmalar tepada
        setOrders(formatted.reverse());
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    // cleanup
    return () => unsubscribe();
  }, []);

  if (loading)
    return <div>
      <Loading/>
    </div>;

  return (
    <div className="p-6 bg-gray-50 mt-15 min-h-screen">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">
        Buyurtmalar ro'yxati
      </h1>

      <div className="space-y-6">
        {orders.length === 0 && (
          <p className="text-gray-500">Hech qanday buyurtma topilmadi.</p>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="border-b p-4 flex justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-semibold text-indigo-900">
                  {order.buyerName || "No Name"}
                </h2>
                <p className="text-gray-500 text-sm">
                  Telegram username: @{order.buyerUsername || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  Telefon raqami: {order.phoneNumber || "N/A"}
                </p>
                <p className="text-gray-500 text-sm">
                  Buyurtma sanasi:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 font-medium text-sm">
                  Jami: {Number(order.totalPrice).toLocaleString()} so'm
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b text-gray-700 text-sm">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Mahsulot</th>
                    <th className="py-3 px-4 text-center">Miqdor</th>
                    <th className="py-3 px-4 text-center">Narxi</th>
                    <th className="py-3 px-4 text-center">Umumiy narxi</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items &&
                    order.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-100 transition-colors not-last:border-b text-gray-700"
                      >
                        <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-center">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {Number(item.price).toLocaleString()} so'm
                        </td>
                        <td className="py-3 px-4 text-center">
                          {Number(item.price * item.quantity).toLocaleString()}{" "}
                          so'm
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
