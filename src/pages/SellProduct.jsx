import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, onValue, update, remove } from "firebase/database";

const SellProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [sellQuantity, setSellQuantity] = useState("");

  // 🔹 Barcha mahsulotlarni yuklash
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
    });
  }, []);

  // 🔹 Tanlangan turdagi mahsulotlarni filterlash
  useEffect(() => {
    if (selectedType) {
      const filtered = products.filter((p) => p.type === selectedType);
      setFilteredProducts(filtered);
      setSelectedProductId("");
    }
  }, [selectedType, products]);

  const handleSell = async (e) => {
    e.preventDefault();

    if (!selectedProductId || !sellQuantity) {
      alert("Iltimos, mahsulot va miqdorni tanlang!");
      return;
    }

    const productRef = ref(db, `products/${selectedProductId}`);
    const selectedProduct = products.find((p) => p.id === selectedProductId);

    if (!selectedProduct) {
      alert("Mahsulot topilmadi!");
      return;
    }

    const newQuantity = selectedProduct.quantity - Number(sellQuantity);

    if (newQuantity < 0) {
      alert("Sotish miqdori mavjud zaxiradan ko‘p!");
      return;
    }

    try {
      if (newQuantity === 0) {
        // 🔥 Agar mahsulot miqdori 0 bo‘lsa, o‘chiramiz
        await remove(productRef);
        alert(`"${selectedProduct.name}" ombordan o‘chirildi (miqdor 0).`);
      } else {
        // 🔹 Aks holda miqdorni yangilaymiz
        await update(productRef, { quantity: newQuantity });
        alert("Mahsulot muvaffaqiyatli sotildi!");
      }

      // 🔄 Formani tozalash
      setSellQuantity("");
      setSelectedProductId("");
    } catch (error) {
      console.error("Xatolik:", error);
    }
  };

  return (
    <div className="max-w-md mt-20 mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Mahsulot sotish</h2>
      <form onSubmit={handleSell} className="space-y-3">
        {/* 🔸 1. Mahsulot turi tanlanadi */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Mahsulot turini tanlang</option>
          <option value="un">Un</option>
          <option value="yog">Yog'</option>
          <option value="tuz">Tuz</option>
          <option value="novvoy">Novvoy mahsulotlari</option>
        </select>

        {/* 🔸 2. Tanlangan turdagi mahsulotlar */}
        {selectedType && (
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Mahsulotni tanlang</option>
            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — ({product.quantity} dona/kg)
              </option>
            ))}
          </select>
        )}

        {/* 🔸 3. Sotiladigan miqdor */}
        {selectedProductId && (
          <input
            type="number"
            value={sellQuantity}
            onChange={(e) => setSellQuantity(e.target.value)}
            placeholder="Sotiladigan miqdor"
            className="w-full border p-2 rounded"
            required
          />
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Sotish
        </button>
      </form>
    </div>
  );
};

export default SellProduct;
