import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

const Customers = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Realtime listener o‘rnatamiz
    const clientsRef = ref(db, "clients");
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const clientsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setClients(clientsArray);
      } else {
        setClients([]);
      }
      setLoading(false);
    });

    // Cleanup
    return () => unsubscribe();
console.log(clients);
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg">
        Yuklanmoqda...
      </div>
    );
  }
  
  console.log("Clients data:", clients);
  return (
    <div className="p-6 mt-15">
      <h1 className="text-2xl font-bold mb-4">Mijozlar ro‘yxati</h1>

      {clients.length === 0 ? (
        <p>Hozircha hech qanday mijoz yo‘q.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">#</th>
                <th className="border px-4 py-2">Ismi</th>
                <th className="border px-4 py-2">Telefon</th>
                <th className="border px-4 py-2">Buyurtma</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, index) => (
                <tr key={client.id}>
                  <td className="border px-4 py-2 text-center">{index + 1}</td>
                  <td className="border px-4 py-2">{client.name || "Noma’lum"}</td>
                  <td className="border px-4 py-2">{client.phone || "-"}</td>
                  <td className="border px-4 py-2">{client.orders || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Customers;
