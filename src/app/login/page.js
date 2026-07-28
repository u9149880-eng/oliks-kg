"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sha256 } from "js-sha256";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatPhone = (value) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned.substring(0, 16);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const passwordHash = sha256(password);

      const { data, error: dbError } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone);

      const userData = data && data.length > 0 ? data[0] : null;

      if (dbError || !userData) {
        setError("Неверный номер или пароль");
        setLoading(false);
        return;
      }

      if (userData.password_hash !== passwordHash) {
        setError("Неверный номер или пароль");
        setLoading(false);
        return;
      }

      localStorage.setItem("user_logged_in", "true");
      localStorage.setItem("user_phone", userData.phone);
      localStorage.setItem("user_id", userData.id);
      localStorage.setItem("user_name", userData.name);
      router.push("/profile");
    } catch (err) {
      setError("Ошибка: " + err.message);
      setLoading(false);
    }
  };

  const brandBlue = "#1a56db";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: brandBlue, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span style={{ background: brandBlue, color: "white", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>O</span>
            liks<span style={{ color: "#64748b", fontWeight: "400" }}>.kg</span>
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>Вход по номеру телефона</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>{error}</div>}

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Номер телефона</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              required
              placeholder="+996 555 123456"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Введите пароль" style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle(brandBlue, loading)}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "20px" }}>
          Нет аккаунта? <a href="/register" style={{ color: brandBlue, fontWeight: "600" }}>Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "6px", color: "#374151", fontWeight: "500", fontSize: "14px" };
const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
const buttonStyle = (color, loading) => ({ width: "100%", padding: "12px", background: color, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 });