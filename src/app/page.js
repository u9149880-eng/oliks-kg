"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const filters = ["Все", "Продажа", "Аренда", "Квартиры", "Дома", "Офисы"];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Все");
  const [loading, setLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [supabase, setSupabase] = useState(null);

  // Инициализация Supabase
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey) {
      setSupabase(createClient(supabaseUrl, supabaseAnonKey));
    }
  }, []);

  // Проверка авторизации и загрузка избранного
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
    if (data) {
      setFavorites(data.map(f => f.listing_id));
    }
  };

  // Загрузка объявлений
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

  return (
    <div style={{ background: "#f0f4f8", minHeight: "100vh" }}>
      <header style={{ background: "white", padding: "16px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", borderBottom: `3px solid ${brandBlue}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: brandBlue, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: brandBlue, color: "white", width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>O</span>
            liks<span style={{ color: "#64748b", fontWeight: "400" }}>.kg</span>
          </h1>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {userLoggedIn ? (
              <a href="/profile" style={linkStyle(brandBlue)}>👤 Профиль</a>
            ) : (
              <a href="/login" style={linkStyle(brandBlue)}>🔑 Войти</a>
            )}
            <a href="/add-listing" style={buttonStyle(brandBlue)}>+ Подать объявление</a>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "1200px", margin: "24px auto", padding: "0 24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button key={filter} onClick={() => setActiveFilter(filter)} style={{
              padding: "8px 16px", borderRadius: "20px",
              border: isActive ? `2px solid ${brandBlue}` : "1px solid #ddd",
              background: isActive ? brandBlue : "white",
              color: isActive ? "white" : "#333",
              cursor: "pointer", fontWeight: "500", fontSize: "14px", transition: "all 0.2s ease",
            }}>{filter}</button>
          );
        })}
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto 12px", padding: "0 24px", color: "#64748b", fontSize: "14px" }}>
        Найдено: <strong>{filteredListings.length}</strong> объявлений
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "18px" }}>⏳ Загрузка...</div>
        ) : filteredListings.length > 0 ? (
          filteredListings.map((item) => (
            <div key={item.id} style={{ background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e8edf3", position: "relative" }}>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} style={{
                position: "absolute", top: "12px", right: item.urgent ? "100px" : "12px", zIndex: 10,
                background: favorites.includes(item.id) ? "#dc2626" : "rgba(255,255,255,0.9)",
                color: favorites.includes(item.id) ? "white" : "#dc2626",
                border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer",
                fontWeight: "bold", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}>{favorites.includes(item.id) ? "❤️" : "🤍"}</button>
              <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: "12px", left: "12px", background: item.type === "Продажа" ? brandBlue : "#0891b2", color: "white", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>{item.type}</span>
                {item.urgent && <span style={{ position: "absolute", top: "12px", right: "12px", background: "#fbbf24", color: "#1e293b", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>⚡ Срочно</span>}
              </div>
              <div style={{ padding: "16px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 8px", color: "#1e293b" }}>{item.title}</h3>
                <div style={{ fontSize: "20px", fontWeight: "bold", color: brandBlue, marginBottom: "4px" }}>{item.price}</div>
                <div style={{ display: "flex", gap: "16px", color: "#64748b", fontSize: "14px", marginBottom: "8px" }}>
                  {item.rooms > 0 && <span>🛏 {item.rooms} комн.</span>}
                  <span>📐 {item.area} м²</span>
                  {item.floor && <span>🏢 {item.floor} этаж</span>}
                </div>
                <div style={{ color: "#94a3b8", fontSize: "13px" }}>📍 {item.address}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", color: "#94a3b8", fontSize: "18px" }}>😔 Ничего не найдено</div>
        )}
      </div>
    </div>
  );
}

const linkStyle = (color) => ({ color, textDecoration: "none", fontSize: "14px", fontWeight: "600", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${color}` });
const buttonStyle = (color) => ({ background: color, color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px", textDecoration: "none" });