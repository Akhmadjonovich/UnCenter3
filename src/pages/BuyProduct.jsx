// src/pages/BuyProduct.jsx
import { useState, useEffect } from "react";
import { ref, onValue, push, update } from "firebase/database";
import { db } from "../firebase";

export default function BuyProduct() {
  const [factories, setFactories] = useState({});
  const [products, setProducts] = useState({});
  const [productTypes, setProductTypes] = useState([
    "Un",
    "Yog'",
    "Tuz",
    "Novvoylar maxsuloti",
  ]);

  const [filteredExisting, setFilteredExisting] = useState([]);

  const [form, setForm] = useState({
    factoryId: "",
    productType: "",
    productName: "",
    existingProductId: "",
    newProductName: "",
    buyPrice: 0,
    sellPrice: 0,
    amount: 0,
    amountType: "dona",
    paid: 0,
  });

  // 🔹 Zavodlar va mahsulotlar
  useEffect(() => {
    onValue(ref(db, "factories"), (snap) => {
      setFactories(snap.val() || {});
    });
    onValue(ref(db, "products"), (snap) => {
      setProducts(snap.val() || {});
    });
  }, []);

  // 🔹 Mahsulot turi bo‘yicha mavjud maxsulotlarni filter qilish
  useEffect(() => {
    if (!form.productType) return;

    const list = Object.entries(products)
      .filter(([id, p]) => p.type === form.productType)
      .map(([id, p]) => ({ id, ...p }));

    setFilteredExisting(list);
  }, [form.productType, products]);

  const handleSubmit = () => {
    if (!form.factoryId || !form.productType || !form.amount || !form.buyPrice) {
      alert("Iltimos barcha asosiy maydonlarni to‘ldiring!");
      return;
    }

    let productIdToUpdate = null;
    let productNameFinal = "";

    // Agar mavjud mahsulot tanlangan bo'lsa → o'shani yangilaymiz
    if (form.existingProductId) {
      const p = products[form.existingProductId];
      productIdToUpdate = form.existingProductId;
      productNameFinal = p.name;

      update(ref(db, `products/${productIdToUpdate}`), {
        quantity: (p.quantity || 0) + Number(form.amount),
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        updatedAt: Date.now(),
      });

    } else {
      // Yangi mahsulot yaratish
      productNameFinal = form.newProductName;

      productIdToUpdate = push(ref(db, "products"), {
        name: form.newProductName,
        type: form.productType,
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        quantity: Number(form.amount),
        amountType: form.amountType,
        createdAt: Date.now(),
      }).key;
    }

    // 🔹 Sotib olish tarixi
    const totalCost = form.buyPrice * form.amount;
    const debtLeft = totalCost - form.paid;

    push(ref(db, "factoryPurchases"), {
      factoryId: form.factoryId,
      productId: productIdToUpdate,
      productName: productNameFinal,
      productType: form.productType,
      buyPrice: Number(form.buyPrice),
      sellPrice: Number(form.sellPrice),
      amount: Number(form.amount),
      amountType: form.amountType,
      paid: Number(form.paid),
      debtLeft,
      date: Date.now(),
    });

    // 🔹 Zavod qarzini yangilash
    const factory = factories[form.factoryId];
    const newDebt = (factory.debt || 0) + debtLeft;
    update(ref(db, `factories/${form.factoryId}`), { debt: newDebt });

    alert("Mahsulot muvaffaqiyatli sotib olindi!");

    setForm({
      factoryId: "",
      productType: "",
      productName: "",
      existingProductId: "",
      newProductName: "",
      buyPrice: 0,
      sellPrice: 0,
      amount: 0,
      amountType: "dona",
      paid: 0,
    });
  };

  return (
    <div className="p-6 max-sm:p-3 mt-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mahsulot sotib olish</h1>

      <div className="bg-white shadow p-6 rounded space-y-4">
        
        {/* Zavod */}
        <div>
          <label className="font-semibold">Zavod</label>
          <select
            value={form.factoryId}
            onChange={(e) => setForm({ ...form, factoryId: e.target.value })}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="">Tanlang</option>
            {Object.entries(factories).map(([id, f]) => (
              <option value={id} key={id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mahsulot turi */}
        <div>
          <label className="font-semibold">Mahsulot turi</label>
          <select
            value={form.productType}
            onChange={(e) =>
              setForm({
                ...form,
                productType: e.target.value,
                existingProductId: "",
                newProductName: "",
              })
            }
            className="w-full p-2 border rounded mt-1"
          >
            <option value="">Tanlang</option>
            {productTypes.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Mavjud mahsulotlar ro‘yxati */}
        {filteredExisting.length > 0 && (
          <div>
            <label className="font-semibold">Mavjud mahsulot</label>
            <select
              value={form.existingProductId}
              onChange={(e) =>
                setForm({
                  ...form,
                  existingProductId: e.target.value,
                  newProductName: "",
                })
              }
              className="w-full p-2 border rounded mt-1"
            >
              <option value="">Yangi mahsulot qo‘shaman</option>
              {filteredExisting.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ({p.quantity} {p.amountType})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Yangi mahsulot nomi */}
        {!form.existingProductId && (
          <div>
            <label className="font-semibold">Yangi mahsulot nomi</label>
            <input
              className="w-full p-2 border rounded mt-1"
              value={form.newProductName}
              onChange={(e) =>
                setForm({ ...form, newProductName: e.target.value })
              }
              placeholder="Masalan: Motabar 25kg"
            />
          </div>
        )}

        {/* Narxlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="font-semibold">Sotib olish narxi (buyPrice)</label>
            <input
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={form.buyPrice}
              onChange={(e) =>
                setForm({ ...form, buyPrice: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Sotish narxi (sellPrice)</label>
            <input
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={form.sellPrice}
              onChange={(e) =>
                setForm({ ...form, sellPrice: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Miqdor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="font-semibold">Miqdor</label>
            <input
              type="number"
              className="w-full p-2 border rounded mt-1"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className="font-semibold">Miqdor turi</label>
            <select
              value={form.amountType}
              onChange={(e) =>
                setForm({ ...form, amountType: e.target.value })
              }
              className="w-full p-2 border rounded mt-1"
            >
              <option value="dona">dona</option>
              <option value="qop">qop</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        {/* To'langan summa */}
        <div>
          <label className="font-semibold">To‘langan summa</label>
          <input
            type="number"
            className="w-full p-2 border rounded mt-1"
            value={form.paid}
            onChange={(e) =>
              setForm({ ...form, paid: Number(e.target.value) })
            }
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          Sotib olish
        </button>
      </div>
    </div>
  );
}
