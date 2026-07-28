"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Profile() {
  const [user, setUser] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState("favorites");
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("user_logged_in");
    const userId = localStorage.getItem("user_id");
    const userPhone = localStorage.getItem("user_phone");
    const userName = localStorage.getItem("user_name");

    if (loggedIn !== "true" || !userId) {
      router.push("/login");
    } else {
      setIsAuth(true);
      setUser({ id: userId, phone: userPhone, name: userName });
    }
  }, []);

  useEffect(() => {
    if (!isAuth || !user) return;

    async function fetchData() {
      // Загружаем избранное
      const { data: favData } = await supabase
        .from("favorites")
        .select("listing_id, listings(*)")
        .eq("user_id", user.id);

      if (favData) {
        setFavorites(favData.map(f => f.listings).filter(Boolean));
      }

      // Загружаем мои объявления (по номеру телефона)
      const { data: myData } = await supabase
        .from("listings")
        .select("*")
        .eq("phone", user.phone)
        .order("created_at", { ascending: false });

      if (myData) {
        setMyListings(myData);
      }
    }

    fetchData();
  }, [isAuth, user]);

  const removeFavorite = async (listingId) => {
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("listing_id", listingId);

    setFavorites(favorites.filter(f => f.id !== listingId));
  };

  const logout = () => {
    localStorage.removeItem("user_logged_in");
    localStorage.removeItem("user_phone");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    router.push("/");
  };

  const brandBlue = "#1a56db";

  if (!isAuth) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <header style={{ background: "white", padding: "16px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: `3px solid ${brandBlue}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "20px", fontWeight: "800", color: brandBlue, margin: 0 }}>
            👤 {user?.name || "Профиль"}
          </h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <a href="/" style={{ color: brandBlue, textDecoration: "none", fontSize: "14px" }}>← На сайт</a>
            <button onClick={logout} style={{ background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1000px", margin: "24px auto", padding: "0 24px" }}>
        {/* Вкладки */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button onClick={() => setTab("favorites")} style={tabStyle(tab === "favorites", brandBlue)}>
            ❤️ Избранное ({favorites.length})
          </button>
          <button onClick={() => setTab("my")} style={tabStyle(tab === "my", brandBlue)}>
            📝 Мои объявления ({myListings.length})
          </button>
        </div>

        {/* Избранное */}
        {tab === "favorites" && (
          <div>
            {favorites.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>Нет избранных объявлений.</p>
            ) : (
              favorites.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <img src={item.image} alt={item.title} style={{ width: "100px", height: "80px", borderRadius: "8px", objectFit: "cover", marginRight: "16px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#1e293b" }}>{item.title}</div>
                    <div style={{ fontSize: "14px", color: brandBlue, fontWeight: "600", marginTop: "4px" }}>{item.price}</div>
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>{item.address}</div>
                  </div>
                  <button onClick={() => removeFavorite(item.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                    Удалить
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Мои объявления */}
        {tab === "my" && (
          <div>
            {myListings.length === 0 ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>У вас пока нет объявлений.</p>
            ) : (
              myListings.map((item) => (
                <div key={item.id} style={cardStyle}>
                  <img src={item.image} alt={item.title} style={{ width: "100px", height: "80px", borderRadius: "8px", objectFit: "cover", marginRight: "16px" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", fontSize: "15px", color: "#1e293b" }}>{item.title}</div>
                    <div style={{ fontSize: "14px", color: brandBlue, fontWeight: "600", marginTop: "4px" }}>{item.price}</div>
                    <span style={{
                      fontSize: "12px", fontWeight: "600",
                      color: item.approved ? "#16a34a" : "#dc2626",
                      background: item.approved ? "#d1fae5" : "#fee2e2",
                      padding: "2px 8px", borderRadius: "10px",
                    }}>
                      {item.approved ? "✅ Одобрено" : "⏳ На модерации"}
                    </span>
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
  padding: "16px",
  marginBottom: "8px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  border: "1px solid #e8edf3",
};