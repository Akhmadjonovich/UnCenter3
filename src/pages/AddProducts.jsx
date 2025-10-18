import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, onValue, update } from "firebase/database";

const AddProduct = () => {
  const [mode, setMode] = useState("new"); // 'new' yoki 'existing'
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  // 🔹 Barcha mahsulotlarni yuklash
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
      } else {
        setProducts([]);
      }
    });
  }, []);

  // 🔹 Mavjud mahsulotlarni tur bo‘yicha filtrlash
  const filteredProducts = products.filter((p) => p.type === type);

  // 🔹 Yangi mahsulot qo‘shish
  const handleAddNew = async (e) => {
    e.preventDefault();
    if (!name || !price || !quantity || !type) {
      alert("Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    try {
      await push(ref(db, "products"), {
        name,
        price: Number(price),
        quantity: Number(quantity),
        type,
      });
      alert("✅ Yangi mahsulot muvaffaqiyatli qo‘shildi!");
      setName("");
      setPrice("");
      setQuantity("");
      setType("");
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Mavjud mahsulotga qo‘shish
  const handleAddToExisting = async (e) => {
    e.preventDefault();

    if (!selectedProductId || !price || !quantity) {
      alert("Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    const productRef = ref(db, `products/${selectedProductId}`);
    const product = products.find((p) => p.id === selectedProductId);

    if (!product) {
      alert("Mahsulot topilmadi!");
      return;
    }

    try {
      const updatedData = {
        ...product,
        price: Number(price), // narx yangilanadi
        quantity: product.quantity + Number(quantity), // miqdor qo‘shiladi
      };

      await update(productRef, updatedData);
      alert("🔁 Mavjud mahsulot yangilandi!");
      setPrice("");
      setQuantity("");
      setSelectedProductId("");
      setType("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md mt-20 mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">🧾 Mahsulot qo‘shish</h2>

      {/* 🔹 Rejim tanlash */}
      <div className="flex gap-4 justify-center mb-4">
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`px-4 py-2 rounded-lg max-md:text-sm font-semibold ${
            mode === "new" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Yangi mahsulot
        </button>

        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`px-4 py-2 rounded-lg max-md:text-sm font-semibold ${
            mode === "existing" ? "bg-blue-600 text-white" : "bg-gray-100"
          }`}
        >
          Mavjud mahsulotga qo‘shish
        </button>
      </div>

      {/* 🔹 Forma */}
      <form
        onSubmit={mode === "new" ? handleAddNew : handleAddToExisting}
        className="space-y-3"
      >
        {/* 🔸 Turi */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Mahsulot turini tanlang</option>
          <option value="un">Un</option>
          <option value="yog">Yog'</option>
          <option value="tuz">Tuz</option>
          <option value="novvoy">Novvoy mahsulotlari</option>
        </select>

        {/* 🔸 Mahsulot tanlash (faqat mavjud rejimda) */}
        {mode === "existing" && type && (
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Mahsulotni tanlang</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — ({product.quantity} dona, {product.price} so'm)
              </option>
            ))}
          </select>
        )}

        {/* 🔸 Nom (faqat yangi rejimda) */}
        {mode === "new" && (
          <input
            type="text"
            placeholder="Mahsulot nomi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        )}

        {/* 🔸 Narx */}
        <input
          type="number"
          placeholder="Narxi (so'm)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {/* 🔸 Miqdor */}
        <input
          type="number"
          placeholder="Miqdori (dona/kg)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {mode === "new"
            ? "➕ Yangi mahsulot qo‘shish"
            : "🔁 Mavjud mahsulotni yangilash"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
