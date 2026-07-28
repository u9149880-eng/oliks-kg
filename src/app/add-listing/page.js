"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AddListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    type: "Продажа",
    category: "Квартиры",
    price: "",
    rooms: "",
    area: "",
    floor: "",
    address: "",
    phone: "",
    description: "",
    image: "",
    urgent: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: dbError } = await supabase.from("listings").insert([
        {
          title: form.title,
          type: form.type,
          category: form.category,
          price: form.price,
          rooms: parseInt(form.rooms) || 0,
          area: parseInt(form.area) || 0,
          floor: form.floor || null,
          address: form.address,
          phone: form.phone,
          description: form.description,
          image: form.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop",
          urgent: form.urgent,
          approved: false,
        },
      ]);

      if (dbError) {
        setError("Ошибка: " + dbError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      setForm({
        title: "",
        type: "Продажа",
        category: "Квартиры",
        price: "",
        rooms: "",
        area: "",
        floor: "",
        address: "",
        phone: "",
        description: "",
        image: "",
        urgent: false,
      });
    } catch (err) {
      setError("Ошибка: " + err.message);
      setLoading(false);
    }
  };

  const brandBlue = "#1a56db";

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <header style={{ background: "white", padding: "16px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: `3px solid ${brandBlue}` }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: brandBlue, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: brandBlue, color: "white", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>O</span>
            liks<span style={{ color: "#64748b", fontWeight: "400" }}>.kg</span>
          </h1>
          <a href="/" style={{ color: brandBlue, textDecoration: "none", fontSize: "14px", fontWeight: "500" }}>← На главную</a>
        </div>
      </header>

      <div style={{ maxWidth: "600px", margin: "32px auto", padding: "0 24px" }}>
        <div style={{ background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", margin: "0 0 24px" }}>📝 Подать объявление</h2>

          {success && (
            <div style={{ background: "#d1fae5", color: "#065f46", padding: "16px", borderRadius: "12px", marginBottom: "20px", textAlign: "center", fontWeight: "600" }}>
              ✅ Объявление отправлено на модерацию!
            </div>
          )}

          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Заголовок *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required placeholder="Например: 2-комнатная квартира в центре" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Тип сделки *</label>
                <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                  <option value="Продажа">Продажа</option>
                  <option value="Аренда">Аренда</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Категория *</label>
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  <option value="Квартиры">Квартиры</option>
                  <option value="Дома">Дома</option>
                  <option value="Офисы">Офисы</option>
                  <option value="Участки">Участки</option>
                  <option value="Коммерческая">Коммерческая</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Цена *</label>
              <input type="text" name="price" value={form.price} onChange={handleChange} required placeholder="55 000 $ или 350 $/мес" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={labelStyle}>Комнат</label>
                <input type="number" name="rooms" value={form.rooms} onChange={handleChange} placeholder="2" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Площадь (м²) *</label>
                <input type="number" name="area" value={form.area} onChange={handleChange} required placeholder="46" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Этаж</label>
                <input type="text" name="floor" value={form.floor} onChange={handleChange} placeholder="3/9" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Адрес *</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="ул. Киевская, 45" style={inputStyle} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Телефон *</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} required placeholder="+996 555 123456" style={inputStyle} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Ссылка на фото</label>
              <input type="url" name="image" value={form.image} onChange={handleChange} placeholder="https://..." style={inputStyle} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Описание</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Опишите преимущества..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="checkbox" name="urgent" checked={form.urgent} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
              <label style={{ color: "#374151", fontSize: "14px", cursor: "pointer" }}>⚡ Срочное объявление</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: brandBlue,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Отправка..." : "📤 Подать объявление"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#374151",
  fontWeight: "500",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};