// src/pages/SellProduct.jsx
import { useState, useEffect } from "react";
import { ref, onValue, update, push } from "firebase/database";
import { db } from "../firebase";

export default function SellProduct() {
  const [products, setProducts] = useState({});
  const [customers, setCustomers] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [pay, setPay] = useState(""); // boshida bo'sh

  // 🔹 Load products
  useEffect(() => {
    const productsRef = ref(db, "products");
    return onValue(productsRef, (snap) => {
      setProducts(snap.val() || {});
    });
  }, []);

  // 🔹 Load customers
  useEffect(() => {
    const customersRef = ref(db, "customers");
    return onValue(customersRef, (snap) => {
      setCustomers(snap.val() || {});
    });
  }, []);

  const filteredCustomers = Object.entries(customers).filter(([id, c]) =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = Object.entries(products).filter(([id, p]) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const addToCart = (productId, amount, unit, price) => {
    const p = products[productId];
    if (!p) return;
    if (amount > p.quantity) {
      alert(`Skladda yetarli miqdor yo'q! (${p.quantity} ${unit} mavjud)`);
      return;
    }

    const exists = cart.find((c) => c.productId === productId);
    if (exists) {
      setCart(cart.map(c =>
        c.productId === productId ? { ...c, quantity: c.quantity + amount, price } : c
      ));
    } else {
      setCart([...cart, {
        productId,
        name: p.name,
        type: p.type,
        price,
        quantity: amount,
        unit,
      }]);
    }
  };

  const removeFromCart = (productId) => setCart(cart.filter(c => c.productId !== productId));

  const totalCartPrice = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleSell = () => {
    if (!selectedCustomerId) return alert("Mijozni tanlang!");
    if (cart.length === 0) return alert("Savatcha bo'sh!");
    if (!pay || pay < 0) return alert("To‘lov summasini kiriting!");

    const customer = customers[selectedCustomerId];
    let remainingPay = Number(pay);

    const updates = {};

    // 🔹 Update products quantity
    cart.forEach(c => {
      const product = products[c.productId];
      updates[`products/${c.productId}/quantity`] = product.quantity - c.quantity;
    });

    // 🔹 Prepare purchase history
    const now = Date.now();
    const totalPrice = totalCartPrice;
    const totalPaid = Math.min(remainingPay, totalPrice);
    const totalDebt = totalPrice - totalPaid;

    const items = cart.map(c => ({
      productId: c.productId,
      productName: c.name,
      productType: c.type,
      amount: c.quantity,
      amountType: c.unit,
      price: c.price,
      totalPrice: c.price * c.quantity
    }));

    // 🔹 Save one purchase with multiple items
    push(ref(db, "customerPurchases"), {
      customerId: selectedCustomerId,
      items,
      totalPrice,
      paid: totalPaid,
      debtLeft: totalDebt,
      date: now
    });

    // 🔹 Update customer debt
    updates[`customers/${selectedCustomerId}/debt`] = (customer.debt || 0) + totalDebt;

    // 🔹 Push updates
    update(ref(db), updates);

    alert("Savdo muvaffaqiyatli amalga oshirildi!");
    setCart([]);
    setPay(""); // inputni bo‘shatish
  };

  return (
    <div className="p-6 mt-16">
      <h1 className="text-2xl font-bold mb-4">Mahsulot sotish</h1>

      {/* Mijoz tanlash */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Mijoz ismi bo'yicha qidirish..."
          className="p-2 border rounded w-full mb-2"
          value={customerSearch}
          onChange={(e) => setCustomerSearch(e.target.value)}
        />
        <select
          className="p-2 border rounded w-full"
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
        >
          <option value="">-- Mijozni tanlang --</option>
          {filteredCustomers.map(([id, c]) => (
            <option key={id} value={id}>
              {c.name} ({c.phone})
            </option>
          ))}
        </select>
      </div>

      {/* Mahsulot qidirish */}
      <input
        type="text"
        placeholder="Mahsulot bo'yicha qidirish..."
        className="p-2 border rounded w-full mb-4"
        value={productSearch}
        onChange={(e) => setProductSearch(e.target.value)}
      />

      {/* Mahsulotlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {filteredProducts.map(([id, p]) => (
          <div key={id} className="p-4 bg-white shadow rounded">
            <h3 className="font-semibold text-lg">{p.name}</h3>
            <p className="text-sm">Turi: {p.type}</p>
            <p className="text-xl font-bold text-red-600">{p.price.toLocaleString()} so'm</p>
            <p>Miqdori: {p.quantity} {p.unit || "dona"}</p>

            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                max={p.quantity}
                placeholder="Miqdor"
                className="p-1 border rounded w-1/3"
                id={`amount-${id}`}
              />
              <input
                type="number"
                placeholder="Narx"
                className="p-1 border rounded w-1/3"
                id={`price-${id}`}
                defaultValue={p.price}
              />
              <select id={`unit-${id}`} className="p-1 border rounded w-1/3">
                <option value="dona">dona</option>
                <option value="qop">qop</option>
                <option value="kg">kg</option>
              </select>
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded"
                onClick={() => {
                  const amount = +document.getElementById(`amount-${id}`).value;
                  const unit = document.getElementById(`unit-${id}`).value;
                  const price = +document.getElementById(`price-${id}`).value;
                  addToCart(id, amount, unit, price);
                }}
              >
                Qo'shish
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Savatcha */}
      <h2 className="text-xl font-semibold mb-2">Savatcha</h2>
      {cart.length === 0 && <p>Hali mahsulot tanlanmagan</p>}
      {cart.map(c => (
        <div key={c.productId} className="flex justify-between bg-white p-2 rounded shadow mb-2">
          <div>
            <p>{c.name} ({c.type})</p>
            <p>{c.quantity} {c.unit} x {c.price.toLocaleString()} so'm</p>
          </div>
          <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => removeFromCart(c.productId)}>O'chirish</button>
        </div>
      ))}

      <div className="mt-4">
        <p className="font-semibold">Jami summa: {totalCartPrice.toLocaleString()} so'm</p>
        <input
          type="number"
          className="p-2 border rounded w-full mt-2"
          placeholder="Mijoz qancha to'layapti?"
          value={pay}
          onChange={(e) => setPay(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded w-full"
          onClick={handleSell}
        >
          Sotish
        </button>
      </div>
    </div>
  );
}
