"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const countries = [
  "Кыргызстан",
  "Россия",
  "Казахстан",
  "Узбекистан",
  "Таджикистан",
  "Туркменистан",
  "Другая",
];

async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Кыргызстан");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passportFile, setPassportFile] = useState(null);
  const [passportPreview, setPassportPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatPhone = (value) => {
    let cleaned = value.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) cleaned = "+" + cleaned;
    return cleaned.substring(0, 16);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPassportFile(file);
    setPassportPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (phone.length < 10) {
      setError("Введите корректный номер телефона");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (!passportFile) {
      setError("Сделайте фото паспорта или селфи с паспортом");
      return;
    }

    setLoading(true);

    try {
      // Создаём клиент здесь, внутри обработчика
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Ошибка конфигурации");
        setLoading(false);
        return;
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // Загрузка фото
      const fileName = `${Date.now()}_${passportFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("passports")
        .upload(fileName, passportFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("Ошибка загрузки фото: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("passports")
        .getPublicUrl(fileName);

      const photoUrl = publicUrlData?.publicUrl;
      if (!photoUrl) {
        setError("Не удалось получить ссылку на фото");
        setLoading(false);
        return;
      }

      const passwordHash = await sha256(password);

      const { error: dbError } = await supabase.from("users").insert([
        {
          phone,
          password_hash: passwordHash,
          name: name || "Пользователь",
          country,
          passport_photo: photoUrl,
          verified: false,
          email: "",
        },
      ]);

      if (dbError) {
        if (dbError.message.includes("duplicate key")) {
          setError("Пользователь с таким номером уже существует");
        } else {
          setError("Ошибка: " + dbError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess("Регистрация успешна! Ожидайте верификации.");
      setTimeout(() => {
        localStorage.setItem("user_logged_in", "true");
        localStorage.setItem("user_phone", phone);
        router.push("/profile");
      }, 2000);
    } catch (err) {
      setError("Ошибка: " + err.message);
      setLoading(false);
    }
  };

  const brandBlue = "#1a56db";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "100%", maxWidth: "460px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: brandBlue, margin: 0 }}>
            <span style={{ background: brandBlue, color: "white", width: "36px", height: "36px", borderRadius: "8px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "18px", marginRight: "8px" }}>O</span>
            liks<span style={{ color: "#64748b", fontWeight: "400" }}>.kg</span>
          </h1>
          <p style={{ color: "#64748b", marginTop: "8px", fontSize: "14px" }}>Регистрация с верификацией</p>
        </div>

        <form onSubmit={handleRegister}>
          {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>{error}</div>}
          {success && <div style={{ background: "#d1fae5", color: "#065f46", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", textAlign: "center" }}>{success}</div>}

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Имя</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше полное имя" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Страна *</label>
            <select value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle}>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Номер телефона *</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} required placeholder="+996 555 123456" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Пароль *</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Минимум 6 символов" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Подтвердите пароль *</label>
            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required placeholder="Повторите пароль" style={inputStyle} />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Фото паспорта / селфи с паспортом *</label>
            <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} id="cameraInput" style={{ display: "none" }} />
            <button type="button" onClick={() => document.getElementById("cameraInput").click()} style={{ width: "100%", padding: "12px", background: brandBlue, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              📸 Сделать фото паспорта
            </button>
            {passportFile && <p style={{ fontSize: "12px", color: "#16a34a", margin: "4px 0", textAlign: "center" }}>✅ Файл выбран: {passportFile.name}</p>}
            {passportPreview && (
              <div style={{ marginTop: "8px" }}>
                <img src={passportPreview} alt="Превью паспорта" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
              </div>
            )}
            {uploading && <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>Загрузка фото...</p>}
          </div>

          <button type="submit" disabled={loading || uploading} style={buttonStyle(brandBlue, loading || uploading)}>
            {loading ? "Регистрация..." : uploading ? "Загрузка..." : "Зарегистрироваться"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "13px", marginTop: "20px" }}>
          Уже есть аккаунт? <a href="/login" style={{ color: brandBlue, fontWeight: "600" }}>Войти</a>
        </p>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "6px", color: "#374151", fontWeight: "500", fontSize: "14px" };
const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "white" };
const buttonStyle = (color, loading) => ({ width: "100%", padding: "12px", background: color, color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 });