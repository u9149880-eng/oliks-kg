"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const filters = [
  { label: "Все", icon: "🏠" },
  { label: "Продажа", icon: "💰" },
  { label: "Аренда", icon: "📅" },
  { label: "Квартиры", icon: "🏢" },
  { label: "Дома", icon: "🏡" },
  { label: "Офисы", icon: "🏬" },
];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Все");
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [supabase, setSupabase] = useState(null);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      setSupabase(createClient(supabaseUrl, supabaseAnonKey));
    }
  }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("user_logged_in");
    const id = localStorage.getItem("user_id");
    if (loggedIn === "true" && id) {
      setUserLoggedIn(true);
      setUserId(id);
      if (supabase) loadFavorites(id);
    }
  }, [supabase]);

  const loadFavorites = async (uid) => {
    if (!supabase) return;
    const { data } = await supabase
      .from("favorites")
      .select("listing_id")
      .eq("user_id", uid);
    if (data) setFavorites(data.map(f => f.listing_id));
  };

  useEffect(() => {
    if (!supabase) return;
    async function fetchListings() {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });
      if (!error) setListings(data || []);
      setLoading(false);
    }
    fetchListings();
  }, [supabase]);

  const toggleFavorite = async (listingId) => {
    if (!userLoggedIn) {
      window.location.href = "/login";
      return;
    }
    if (!supabase) return;
    if (favorites.includes(listingId)) {
      await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
      setFavorites(favorites.filter(id => id !== listingId));
    } else {
      await supabase.from("favorites").insert([{ user_id: userId, listing_id: listingId }]);
      setFavorites([...favorites, listingId]);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (activeFilter === "Все") return true;
    if (activeFilter === "Продажа" || activeFilter === "Аренда") return item.type === activeFilter;
    return item.category === activeFilter;
  });

  const brandBlue = "#1a56db";
  const brandLightBlue = "#3b82f6";
  const bgColor = "#f5f7fa";

  return (
    <div style={{ background: bgColor, minHeight: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* Шапка в стиле Lalafo */}
      <header style={{
        background: "white", padding: "12px 16px", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)", borderBottom: "1px solid #eef2f7",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Логотип */}
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
              background: `linear-gradient(135deg, ${brandBlue}, ${brandLightBlue})`,
              color: "white", width: "34px", height: "34px", borderRadius: "10px",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: "800",
            }}>O</span>
            <span style={{ fontSize: "20px", fontWeight: "700", color: brandBlue }}>liks</span>
            <span style={{ fontSize: "20px", fontWeight: "400", color: "#94a3b8" }}>.kg</span>
          </a>

          {/* Поиск (как у Lalafo) */}
          <div style={{
            flex: 1, maxWidth: "500px", margin: "0 20px",
            background: "#f1f5f9", borderRadius: "12px", display: "flex", alignItems: "center",
            padding: "8px 16px", gap: "8px",
          }}>
            <span style={{ color: "#94a3b8", fontSize: "16px" }}>🔍</span>
            <input
              type="text"
              placeholder="Поиск по адресу или названию..."
              style={{
                border: "none", background: "transparent", outline: "none",
                width: "100%", fontSize: "14px", color: "#1e293b",
              }}
            />
          </div>

          {/* Кнопки справа */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {userLoggedIn ? (
              <a href="/profile" style={{
                color: brandBlue, textDecoration: "none", fontSize: "14px", fontWeight: "600",
                padding: "6px 12px", borderRadius: "8px", background: "#eff6ff",
              }}>👤 Профиль</a>
            ) : (
              <a href="/login" style={{
                color: brandBlue, textDecoration: "none", fontSize: "14px", fontWeight: "600",
                padding: "6px 12px", borderRadius: "8px", background: "#eff6ff",
              }}>🔑 Войти</a>
            )}
          </div>
        </div>
      </header>

      {/* Фильтры в стиле Lalafo — круглые иконки */}
      <div style={{ maxWidth: "1200px", margin: "16px auto 0", padding: "0 16px", display: "flex", gap: "12px", overflowX: "auto", whiteSpace: "nowrap" }}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter.label;
          return (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                padding: "10px 14px", borderRadius: "16px",
                border: isActive ? `2px solid ${brandBlue}` : "1px solid #e2e8f0",
                background: isActive ? "#eff6ff" : "white",
                color: isActive ? brandBlue : "#64748b",
                cursor: "pointer", fontWeight: "500", fontSize: "12px",
                minWidth: "70px", transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: "20px" }}>{filter.icon}</span>
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Сетка объявлений */}
      <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 16px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Найдено <strong style={{ color: "#1e293b" }}>{filteredListings.length}</strong> объявлений
          </p>
          <select style={{
            padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0",
            fontSize: "13px", color: "#64748b", background: "white", outline: "none",
          }}>
            <option>Сначала новые</option>
            <option>Сначала дешёвые</option>
            <option>Сначала дорогие</option>
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <p>Загрузка объявлений...</p>
          </div>
        ) : filteredListings.length > 0 ? (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {filteredListings.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "white", borderRadius: "16px", overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9",
                  transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                }}
              >
                {/* Фото */}
                <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                  <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  
                  {/* Плашка типа */}
                  <span style={{
                    position: "absolute", top: "10px", left: "10px",
                    background: item.type === "Продажа" ? brandBlue : "#0891b2",
                    color: "white", padding: "3px 8px", borderRadius: "6px",
                    fontSize: "11px", fontWeight: "600",
                  }}>{item.type}</span>

                  {/* Срочно */}
                  {item.urgent && (
                    <span style={{
                      position: "absolute", top: "10px", right: "40px",
                      background: "#fbbf24", color: "#1e293b", padding: "3px 8px",
                      borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                    }}>⚡ Срочно</span>
                  )}

                  {/* Избранное */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                    style={{
                      position: "absolute", top: "10px", right: "10px",
                      background: "rgba(255,255,255,0.95)", border: "none",
                      width: "32px", height: "32px", borderRadius: "50%",
                      cursor: "pointer", fontSize: "16px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {favorites.includes(item.id) ? "❤️" : "🤍"}
                  </button>
                </div>

                {/* Информация */}
                <div style={{ padding: "14px" }}>
                  <h3 style={{
                    fontSize: "15px", fontWeight: "600", margin: "0 0 6px",
                    color: "#1e293b", lineHeight: "1.3",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{item.title}</h3>
                  
                  <div style={{
                    fontSize: "18px", fontWeight: "700", color: brandBlue,
                    marginBottom: "8px",
                  }}>
                    {item.price}
                  </div>

                  <div style={{
                    display: "flex", gap: "12px", color: "#64748b",
                    fontSize: "13px", marginBottom: "8px",
                  }}>
                    {item.rooms > 0 && <span>🛏 {item.rooms}</span>}
                    <span>📐 {item.area} м²</span>
                    {item.floor && <span>🏢 {item.floor} эт.</span>}
                  </div>

                  <div style={{
                    color: "#94a3b8", fontSize: "12px",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    <span>📍</span> {item.address}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: "50px", marginBottom: "12px" }}>📭</div>
            <p style={{ fontSize: "16px", fontWeight: "500" }}>Ничего не найдено</p>
            <p style={{ fontSize: "14px" }}>Попробуйте изменить фильтр</p>
          </div>
        )}
      </div>

      {/* FAB-кнопка Подать объявление (как у Lalafo) */}
      <a href="/add-listing" style={{
        position: "fixed", bottom: "24px", right: "24px",
        background: `linear-gradient(135deg, ${brandBlue}, ${brandLightBlue})`,
        color: "white", width: "56px", height: "56px", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "28px", fontWeight: "300", textDecoration: "none",
        boxShadow: "0 4px 14px rgba(26, 86, 219, 0.4)",
        zIndex: 50, transition: "transform 0.2s",
      }}>
        +
      </a>
    </div>
  );
}