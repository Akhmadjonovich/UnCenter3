import React, { useEffect, useState } from "react";
import { FaShoppingCart, FaUsers } from "react-icons/fa";
import { FcMoneyTransfer } from "react-icons/fc";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import Loading from "./Loading";
const Dashboard = () => {
  const [active, setActive] = useState("Barchasi");
  const categories = ["Barchasi", "Un", "Yog'", "Tuz", "Novvoylar uchun"];
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientsCount, setClientsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  // ✅ Ma’lumotlarni olish
  useEffect(() => {
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
      setLoading(false)
    });
  }, []);

  
  useEffect(() => {
    const ordersRef = ref(db, "orders");

    // 🔁 Realtime listener
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const ordersArray = Object.values(data);
        const totalOrders = ordersArray.length;

        // 🧮 Telefon raqam bo‘yicha unique mijozlar sonini hisoblash
        const uniquePhones = new Set(
          ordersArray
            .map((order) => order.phoneNumber)
            .filter((num) => !!num) // null/undefined ni olib tashlaydi
        );

        setOrdersCount(totalOrders);
        setClientsCount(uniquePhones.size);
      } else {
        setOrdersCount(0);
        setClientsCount(0);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Kategoriyalar bo‘yicha filtrlash
  const filteredProducts =
    active === "Barchasi"
      ? products
      : products.filter(
          (item) =>
            item.type?.toLowerCase() === active.toLowerCase() ||
            (active === "Novvoylar uchun" && item.type === "novvoy")
        );

  // ✅ Hisoblashlar
  const totalProfit = filteredProducts.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );

  const totalProducts = filteredProducts.length;
  const totalOrders = filteredProducts.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  
  if (loading)
    return <div>
      <Loading/>
    </div>;

  return (
    <div>
      {/* 📊 Statistikalar */}
      <section className="mt-20 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1 p-4 max-lg:p-0 *:bg-white *:p-4 *:rounded-lg *:shadow-2xl">
        <div className="flex items-center gap-4 max-lg:w-full">
          <FcMoneyTransfer className="text-6xl max-lg:text-4xl bg-purple-100 p-2 rounded-lg" />
          <div>
            <h3 className="text-xl max-xl:text-lg font-semibold text-gray-500">
              Umumiy Foyda
            </h3>
            <h4 className="text-xl max-xl:text-sm font-bold">
              {totalProfit.toLocaleString()} so‘m
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <FaUsers className="text-6xl max-lg:text-4xl text-[#155CA5] bg-purple-100 p-2 rounded-lg" />
          <div>
            <h3 className="text-xl max-xl:text-lg font-semibold text-gray-500">
              Mijozlar
            </h3>
            <h4 className="text-xl max-xl:text-sm font-bold">
              {clientsCount} ta
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <FaShoppingCart className="text-6xl max-lg:text-4xl text-[#155CA5] bg-purple-100 p-2 rounded-lg" />
          <div>
            <h3 className="text-xl max-xl:text-lg font-semibold text-gray-500">
              Buyurtmalar
            </h3>
            <h4 className="text-xl max-xl:text-sm font-bold">
              {ordersCount} ta
            </h4>
          </div>
        </div>
      </section>

      {/* 🏷 Kategoriyalar */}
      <section className="my-5 p-4 max-lg:p-0">
        <h3 className="text-xl max-lg:text-lg font-bold">
          Skladda mavjud mahsulotlar:
        </h3>

        <div className="mt-5 bg-white p-2 rounded-lg flex items-center shadow-2xl">
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActive(category)}
                className={`px-5 py-2.5 rounded-full text-sm max-md:text-[10px] font-semibold transition-all duration-200 
                  ${
                    active === category
                      ? "bg-[#155CA5] text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 📦 Mahsulotlar jadvali */}
      <section className="p-4 max-lg:p-0">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-[#155CA5] to-blue-500 text-white">
              <tr>
                <th className="py-3 px-5 text-left text-sm max-md:text-[10px] font-semibold uppercase tracking-wide">
                  Nomi
                </th>
                <th className="py-3 px-5 text-left text-sm max-md:text-[10px] font-semibold uppercase tracking-wide">
                  Turi
                </th>
                <th className="py-3 px-5 text-left text-sm max-md:text-[10px] font-semibold uppercase tracking-wide">
                  Narxi
                </th>
                <th className="py-3 px-5 text-left text-sm max-md:text-[10px] font-semibold uppercase tracking-wide">
                  Miqdori
                </th>
                <th className="py-3 px-5 text-left text-sm max-md:text-[10px] font-semibold uppercase tracking-wide">
                  Umumiy summa
                </th>
              </tr>
            </thead>

            <tbody className="text-gray-700 divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-5 text-gray-500 italic"
                  >
                    Hozircha ma’lumot yo‘q...
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-purple-50 transition max-md:text-sm"
                  >
                    <td className="py-3 px-5 font-medium">{item.name}</td>
                    <td className="py-3 px-5">{item.type}</td>
                    <td className="py-3 px-5">
                      {item.price.toLocaleString()} so‘m
                    </td>
                    <td className="py-3 px-5">{item.quantity}</td>
                    <td className="py-3 px-5 font-semibold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} so‘m
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
