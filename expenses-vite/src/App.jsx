import React, { useState } from "react";
import axios from "axios";
import { CATEGORIES, MAX_PARCELS } from "./variables";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

export default function App() {
  const [formData, setFormData] = useState({
    nome: "",
    valor: "",
    parcela: 1,
    categoria: CATEGORIES[0],
    tipo: "Débito",
    data: new Date().toISOString().split("T")[0],
  });

  const tipos = ["Crédito", "Débito", "PIX"];

  const formatCurrency = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const number = parseFloat(cleaned) / 100;

    if (isNaN(number)) return "";
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "valor") {
      const formatted = formatCurrency(value);
      setFormData((prev) => ({ ...prev, valor: formatted }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "parcela" ? parseInt(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parcelas = parseInt(formData.parcela);
    const initialDate = new Date(formData.data);
    const valorLimpo = parseFloat(formData.valor.replace(/[^\d]+/g, "")) / 100;

    try {
      for (let i = 0; i < parcelas; i++) {
        const parcelDate = new Date(initialDate);
        parcelDate.setMonth(initialDate.getMonth() + i);

        await axios.post(`${import.meta.env.VITE_API_URL}/expenses`, {
          nome: formData.nome,
          valor: valorLimpo,
          parcela: i + 1,
          totalParcelas: parcelas,
          categoria: formData.categoria,
          tipo: formData.tipo,
          data: parcelDate.toISOString().split("T")[0],
        });
      }
      toast.success("Gasto Salvo  com sucesso!");
      setFormData({
        nome: "",
        valor: "",
        parcela: 1,
        categoria: CATEGORIES[0],
        tipo: "Débito",
        data: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("Erro ao salvar gastos!:", error);
      toast.error("Erro ao salvar gastos!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Registro de Despesa</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="valor"
            placeholder="Valor"
            value={formData.valor}
            onChange={handleChange}
            type="text"
            inputMode="numeric"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            name="parcela"
            value={formData.parcela}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: MAX_PARCELS }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}x
              </option>
            ))}
          </select>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            name="data"
            type="date"
            value={formData.data}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Salvar
          </button>
        </form>
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
