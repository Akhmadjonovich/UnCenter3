// src/pages/EditProduct.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, update } from "firebase/database";

const EditProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [form, setForm] = useState({ name: "", type: "", price: "", quantity: "" });
  const [loading, setLoading] = useState(false);

  const categories = ["Un", "Yog'", "Tuz", "Novvoylar uchun"];

  // 🔹 Barcha mahsulotlarni olish
  useEffect(() => {
    const productsRef = ref(db, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setProducts(loaded);
      }
    });
  }, []);

  // 🔸 Kategoriya tanlanganda filterlash
  useEffect(() => {
    if (selectedCategory) {
      const filtered = products.filter(
        (p) => p.type.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [selectedCategory, products]);

  // 🔸 Mahsulot tanlaganda formani to‘ldirish
  const handleSelectProduct = (id) => {
    const p = filteredProducts.find((x) => x.id === id);
    setSelectedProductId(id);
    if (p)
      setForm({
        name: p.name,
        type: p.type,
        price: p.price,
        quantity: p.quantity,
      });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProductId) return alert("Mahsulot tanlanmagan!");

    setLoading(true);
    try {
      const productRef = ref(db, `products/${selectedProductId}`);
      await update(productRef, {
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });
      alert("✅ Mahsulot muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error("Xatolik:", error);
      alert("❌ Xatolik yuz berdi!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mt-20 mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6 text-center">🛠 Mahsulotni tahrirlash</h2>

      {/* 1️⃣ Kategoriya tanlash */}
      <div className="mb-4">
        <label className="font-semibold text-gray-600 mb-1 block">Kategoriya:</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedProductId("");
            setForm({ name: "", type: "", price: "", quantity: "" });
          }}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Kategoriya tanlang</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 2️⃣ Kategoriyaga qarab mahsulot tanlash */}
      {selectedCategory && (
        <div className="mb-4">
          <label className="font-semibold text-gray-600 mb-1 block">Mahsulot:</label>
          <select
            value={selectedProductId}
            onChange={(e) => handleSelectProduct(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Mahsulot tanlang</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3️⃣ Forma */}
      {selectedProductId && (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Mahsulot nomi"
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Narxi (so‘m)"
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Miqdori"
            className="w-full border p-2 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Yangilanmoqda..." : "Yangilash"}
          </button>
        </form>
      )}
    </div>
  );
};

export default EditProduct;
