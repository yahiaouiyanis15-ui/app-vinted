import { useState } from "react";

const MAX_GRATUIT = 3;

function App() {
  const [description, setDescription] = useState("");
  const [plateforme, setPlateforme] = useState("Vinted");
  const [ton, setTon] = useState("neutre");
  const [resultat, setResultat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [compteur, setCompteur] = useState(() => parseInt(localStorage.getItem("compteur") || "0"));
  const [historique, setHistorique] = useState(() => JSON.parse(localStorage.getItem("historique") || "[]"));
  const [copie, setCopie] = useState(false);
  const [onglet, setOnglet] = useState("generateur");

  const estGratuit = compteur < MAX_GRATUIT;

  const generer = async () => {
    if (!description.trim()) { setErreur("Decris ton article !"); return; }
    if (!estGratuit) { setErreur("Limite gratuite atteinte ! Abonne-toi pour continuer."); return; }
    setLoading(true);
    setErreur("");
    setResultat(null);
    try {
      const response = await fetch("http://localhost:3001/api/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, plateforme, ton }),
      });
      const data = await response.json();
      if (data.erreur) {
        setErreur(data.erreur);
      } else {
        setResultat(data);
        const newCompteur = compteur + 1;
        setCompteur(newCompteur);
        localStorage.setItem("compteur", newCompteur);
        const newHistorique = [{ date: new Date().toLocaleDateString(), plateforme, description, ...data }, ...historique].slice(0, 10);
        setHistorique(newHistorique);
        localStorage.setItem("historique", JSON.stringify(newHistorique));
      }
    } catch (e) {
      setErreur("Erreur de connexion au serveur.");
    }
    setLoading(false);
  };

  const copierAnnonce = () => {
    if (!resultat) return;
    const texte = `${resultat.titre}\n\n${resultat.description}\n\nPrix : ${resultat.prix}\n\nMots-clés : ${resultat.mots_cles?.join(", ")}`;
    navigator.clipboard.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  return (
    <div style={{ maxWidth: 650, margin: "0 auto", fontFamily: "Arial", padding: 20, minHeight: "100vh" }}>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#09B1BA", margin: 0, fontSize: 28 }}>🛍️ AnnonceAI</h1>
        <p style={{ color: "#888", margin: "4px 0 0" }}>Génère des annonces qui vendent en 5 secondes</p>
      </div>

      <div style={{ backgroundColor: estGratuit ? "#e8f8f8" : "#fff0f0", border: `1px solid ${estGratuit ? "#09B1BA" : "#ff4444"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: estGratuit ? "#09B1BA" : "#ff4444", fontWeight: "bold" }}>
          {estGratuit ? `✅ ${MAX_GRATUIT - compteur} annonce(s) gratuite(s) restante(s)` : "🔒 Limite atteinte — Abonne-toi !"}
        </span>
        {!estGratuit && (
          <button style={{ backgroundColor: "#ff9900", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: "bold" }}>
            S'abonner 4,99€/mois
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["generateur", "historique"].map(o => (
          <button key={o} onClick={() => setOnglet(o)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", cursor: "pointer", fontWeight: "bold", backgroundColor: onglet === o ? "#09B1BA" : "#eee", color: onglet === o ? "white" : "#333" }}>
            {o === "generateur" ? "✨ Générateur" : "📋 Historique"}
          </button>
        ))}
      </div>

      {onglet === "generateur" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Plateforme</label>
            <select value={plateforme} onChange={(e) => setPlateforme(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", fontSize: 15, color: "white", backgroundColor: "#333" }}>
              <option style={{ color: "white", backgroundColor: "#333" }}>Vinted</option>
              <option style={{ color: "white", backgroundColor: "#333" }}>Leboncoin</option>
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Ton de l'annonce</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[["neutre", "😐 Neutre"], ["urgent", "🔥 Urgent"], ["luxe", "💎 Luxe"], ["decontracte", "😎 Décontracté"]].map(([val, label]) => (
                <button key={val} onClick={() => setTon(val)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `2px solid ${ton === val ? "#09B1BA" : "#ddd"}`, backgroundColor: ton === val ? "#e8f8f8" : "white", cursor: "pointer", fontSize: 13, fontWeight: ton === val ? "bold" : "normal", color: "#333" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6, color: "white" }}>Décris ton article</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Jean Levis 501 taille 40, bleu, tres bon etat, porte 2 fois..." style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", height: 110, resize: "vertical", fontSize: 14, boxSizing: "border-box", color: "white", backgroundColor: "#333" }} />
          </div>

          {erreur && <p style={{ color: "red", marginBottom: 10 }}>{erreur}</p>}

          <button onClick={generer} disabled={loading || !estGratuit} style={{ width: "100%", padding: 14, backgroundColor: estGratuit ? "#09B1BA" : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 16, cursor: estGratuit ? "pointer" : "not-allowed", fontWeight: "bold", marginBottom: 20 }}>
            {loading ? "⏳ Génération en cours..." : "✨ Générer mon annonce"}
          </button>

          {resultat && (
            <div style={{ padding: 20, backgroundColor: "#f9f9f9", borderRadius: 12, border: "1px solid #ddd" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ color: "#09B1BA", margin: 0 }}>✅ Ton annonce</h2>
                <button onClick={copierAnnonce} style={{ backgroundColor: copie ? "#4CAF50" : "#09B1BA", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: "bold" }}>
                  {copie ? "✅ Copié !" : "📋 Tout copier"}
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: "bold", color: "#333" }}>📌 Titre</label>
                <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", color: "#333" }}>{resultat.titre}</p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: "bold", color: "#333" }}>📝 Description</label>
                <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", lineHeight: 1.6, color: "#333" }}>{resultat.description}</p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontWeight: "bold", color: "#333" }}>💰 Prix suggéré</label>
                <p style={{ backgroundColor: "white", padding: 10, borderRadius: 8, border: "1px solid #ddd", margin: "4px 0 0", fontSize: 22, fontWeight: "bold", color: "#09B1BA" }}>{resultat.prix} €</p>
              </div>

              <div>
                <label style={{ fontWeight: "bold", color: "#333" }}>🏷️ Mots-clés</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {Array.isArray(resultat.mots_cles) && resultat.mots_cles.map((mot, i) => (
                    <span key={i} style={{ backgroundColor: "#09B1BA", color: "white", padding: "4px 12px", borderRadius: 20, fontSize: 14 }}>{mot}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {onglet === "historique" && (
        <div>
          {historique.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>Aucune annonce générée pour l'instant</p>
          ) : (
            historique.map((item, i) => (
              <div key={i} style={{ padding: 14, backgroundColor: "#f9f9f9", borderRadius: 10, border: "1px solid #ddd", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: "bold", color: "#09B1BA" }}>{item.titre}</span>
                  <span style={{ color: "#888", fontSize: 12 }}>{item.date} • {item.plateforme}</span>
                </div>
                <p style={{ margin: 0, color: "#555", fontSize: 14 }}>{item.description}</p>
                <span style={{ color: "#09B1BA", fontWeight: "bold" }}>{item.prix} €</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;