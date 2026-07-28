"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [tab, setTab] = useState("listings"); // "listings" или "users"
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const router = useRouter();

  // Проверка авторизации админа
  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in");
    if (loggedIn !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
    }
  }, []);

  // Загрузка объявлений
  useEffect(() => {
    if (!isAuth) return;
    async function fetchListings() {
      setLoadingListings(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setListings(data || []);
      setLoadingListings(false);
    }
    fetchListings();
  }, [isAuth, refresh]);

  // Загрузка пользователей
  useEffect(() => {
    if (!isAuth) return;
    async function fetchUsers() {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setUsers(data || []);
      setLoadingUsers(false);
    }
    fetchUsers();
  }, [isAuth, refresh]);

  // Операции с объявлениями
  const approveListing = async (id) => {
    await supabase.from("listings").update({ approved: true }).eq("id", id);
    setRefresh(!refresh);
  };

  const rejectListing = async (id) => {
    if (confirm("Удалить объявление навсегда?")) {
      await supabase.from("listings").delete().eq("id", id);
      setRefresh(!refresh);
    }
  };

  // Верификация пользователя
  const verifyUser = async (id) => {
    await supabase.from("users").update({ verified: true }).eq("id", id);
    setRefresh(!refresh);
  };

  const unverifyOrDeleteUser = async (id) => {
    if (confirm("Отклонить верификацию и удалить пользователя?")) {
      await supabase.from("users").delete().eq("id", id);
      setRefresh(!refresh);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_logged_in");
    localStorage.removeItem("admin_email");
    router.push("/admin/login");
  };

  const brandBlue = "#1a56db";

  if (!isAuth) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      {/* Шапка */}
      <header style={{ background: "white", padding: "16px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: `3px solid ${brandBlue}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: brandBlue, margin: 0 }}>
            ⚙️ Админ-панель Oliks.kg
          </h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={() => setRefresh(!refresh)} style={{ background: brandBlue, color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
              🔄 Обновить
            </button>
            <a href="/" style={{ color: brandBlue, textDecoration: "none", fontSize: "14px" }}>← На сайт</a>
            <button onClick={logout} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "24px auto", padding: "0 24px" }}>
        {/* Вкладки */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button onClick={() => setTab("listings")} style={tabStyle(tab === "listings", brandBlue)}>
            📋 Объявления ({listings.length})
          </button>
          <button onClick={() => setTab("users")} style={tabStyle(tab === "users", brandBlue)}>
            👥 Пользователи ({users.length})
          </button>
        </div>

        {/* Вкладка "Объявления" */}
        {tab === "listings" && (
          <div>
            {loadingListings ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>⏳ Загрузка...</p>
            ) : listings.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Нет объявлений.</p>
            ) : (
              listings.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#1e293b", marginBottom: "4px" }}>
                      #{item.id} — {item.title}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {item.type} • {item.price} • {item.address}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={statusBadge(item.approved)}>
                      {item.approved ? "✅ Одобрено" : "⏳ Ожидает"}
                    </span>
                    {!item.approved && (
                      <button onClick={() => approveListing(item.id)} style={approveBtn}>
                        Одобрить
                      </button>
                    )}
                    <button onClick={() => rejectListing(item.id)} style={deleteBtn}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Вкладка "Пользователи" */}
        {tab === "users" && (
          <div>
            {loadingUsers ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>⏳ Загрузка...</p>
            ) : users.length === 0 ? (
              <p style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Нет пользователей.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} style={cardStyle}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#1e293b", marginBottom: "4px" }}>
                      #{user.id} — {user.name || "Без имени"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      📞 {user.phone} | 🌍 {user.country || "Не указана"}
                    </div>
                    <div style={{ marginTop: "6px" }}>
                      <a href={user.passport_photo} target="_blank" style={{ fontSize: "13px", color: brandBlue, textDecoration: "underline" }}>
                        📎 Фото паспорта
                      </a>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={statusBadge(user.verified)}>
                      {user.verified ? "✅ Верифицирован" : "⏳ Не проверен"}
                    </span>
                    {!user.verified && (
                      <button onClick={() => verifyUser(user.id)} style={verifyBtn}>
                        ✅ Подтвердить
                      </button>
                    )}
                    <button onClick={() => unverifyOrDeleteUser(user.id)} style={deleteBtn}>
                      ❌ Отклонить
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Стили
const tabStyle = (active, color) => ({
  padding: "8px 16px",
  borderRadius: "8px",
  border: active ? `2px solid ${color}` : "1px solid #ddd",
  background: active ? color : "white",
  color: active ? "white" : "#333",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px",
});

const cardStyle = {
  background: "white",
  padding: "16px 20px",
  marginBottom: "8px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  border: "1px solid #e8edf3",
};

const statusBadge = (approved) => ({
  fontWeight: "600",
  fontSize: "13px",
  color: approved ? "#16a34a" : "#dc2626",
  background: approved ? "#d1fae5" : "#fee2e2",
  padding: "4px 10px",
  borderRadius: "20px",
  whiteSpace: "nowrap",
});

const approveBtn = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
};

const verifyBtn = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
};

const deleteBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
};