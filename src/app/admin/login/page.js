"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Ошибка конфигурации");
        setLoading(false);
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const passwordHash = await sha256(password);

      const { data, error: dbError } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email);

      const adminData = data && data.length > 0 ? data[0] : null;

      if (dbError || !adminData) {
        setError("Неверный email или пароль");
        setLoading(false);
        return;
      }

      if (adminData.password_hash !== passwordHash) {
        setError("Неверный email или пароль");
        setLoading(false);
        return;
      }

      localStorage.setItem("admin_logged_in", "true");
      localStorage.setItem("admin_email", adminData.email);
      router.push("/admin");
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
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>Вход в панель управления</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@oliks.kg" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Пароль</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" required style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "6px", color: "#374151", fontWeight: "500", fontSize: "14px" };
const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box" };
const buttonStyle = { width: "100%", padding: "12px", background: "#1a56db", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "pointer" };