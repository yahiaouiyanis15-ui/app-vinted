import { useState } from "react";

const MAX_GRATUIT = 3;
const CODES_PROMO = ["AX7K9-VINTED-M2P4Q","BF3N8-VINTED-J6R1W","CQ5T2-VINTED-H9L7E","DM8Y6-VINTED-K3N5X","EP2W4-VINTED-G7T8Z","FR9K1-VINTED-B4M6V","GH6J3-VINTED-N2P9Y","HN4X7-VINTED-C8R5T","IQ1M5-VINTED-F6W3K","JB8T9-VINTED-L2X7P","KW3R6-VINTED-D5N4Q","LY7P2-VINTED-M9K1E","MG5N8-VINTED-R3T6Z","NX2K4-VINTED-W7B9V","OT9J1-VINTED-H4L5Y","PQ6W3-VINTED-C8M2X","RF4B7-VINTED-G1N9K","SK8Y5-VINTED-J6T3P","TH1M9-VINTED-B4R7Q","UJ3P6-VINTED-F2W8E","VL7K2-VINTED-N5X4Z","WN4T8-VINTED-M1B6V","XQ9R3-VINTED-K7L2Y","YB6W5-VINTED-D3N8T","ZF2M7-VINTED-R9P4X","AC8J4-VINTED-G5T1K","BD5N1-VINTED-W6M3Q","CE3T6-VINTED-H2R9Z","DG7K8-VINTED-B4L5V","EH1W2-VINTED-N7X6Y"];
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
  const [codePromo, setCodePromo] = useState("");
  const [codeActif, setCodeActif] = useState(() => localStorage.getItem("codeActif") === "true");
  const [messageCode, setMessageCode] = useState("");

  const estGratuit = compteur < MAX_GRATUIT;
  const peutGenerer = estGratuit || codeActif;

  const activerCode = () => {
    if (CODES_PROMO.includes(codePromo.toUpperCase().trim())) {
      setCodeActif(true);
      localStorage.setItem("codeActif", "true");
      setMessageCode("✅ Code activé ! Accès illimité débloqué !");
    } else {
      setMessageCode("❌ Code invalide, réessaie !");
    }
  };

  const generer = async () => {
    if (!description.trim()) { setErreur("Decris ton article !"); return; }
    if (!peutGenerer) { setErreur("Limite gratuite atteinte ! Abonne-toi pour continuer."); return; }
    setLoading(true);
    setErreur("");
    setResultat(null);
    try {
      const response = await fetch("https://app-vinted.onrender.com/api/generer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, plateforme, ton }),
      });
      const data = await response.json();
      if (data.erreur) {
        setErreur(data.erreur);
      } else {
        setResultat(data);
        if (!codeActif) {
          const newCompteur = compteur + 1;
          setCompteur(newCompteur);
          localStorage.setItem("compteur", newCompteur);
        }
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

      {codeActif ? (
        <div style={{ backgroundColor: "#e8f8f8", border: "1px solid #09B1BA", borderRadius: 10, padding: "10px 16px", marginBottom: 20, textAlign: "center" }}>
          <span style={{ color: "#09B1BA", fontWeight: "bold" }}>💎 Accès Premium — Annonces illimitées !</span>
        </div>
      ) : (
        <div style={{ backgroundColor: estGratuit ? "#e8f8f8" : "#fff0f0", border: `1px solid ${estGratuit ? "#09B1BA" : "#ff4444"}`, borderRadius: 10, padding: "10px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: estGratuit ? 0 : 10 }}>
            <span style={{ color: estGratuit ? "#09B1BA" : "#ff4444", fontWeight: "bold" }}>
              {estGratuit ? `✅ ${MAX_GRATUIT - compteur} annonce(s) gratuite(s) restante(s)` : "🔒 Limite atteinte — Abonne-toi !"}
            </span>
            {!estGratuit && (
              <button onClick={() => window.open("https://buy.stripe.com/4gMeVe99t6qfaKD2TIcfK05", "_blank")} style={{ backgroundColor: "#ff9900", color: "white", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontWeight: "bold" }}>
                S'abonner 4,99€/mois
              </button>
            )}
          </div>
          {!estGratuit && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={codePromo} onChange={(e) => setCodePromo(e.target.value)} placeholder="Tu as un code promo ?" style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd", fontSize: 14 }} />
              <button onClick={activerCode} style={{ backgroundColor: "#09B1BA", color: "white", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: "bold" }}>
                Activer
              </button>
            </div>
          )}
          {messageCode && <p style={{ color: messageCode.includes("✅") ? "green" : "red", margin: "8px 0 0", fontSize: 14 }}>{messageCode}</p>}
        </div>
      )}

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

          <button onClick={generer} disabled={loading || !peutGenerer} style={{ width: "100%", padding: 14, backgroundColor: peutGenerer ? "#09B1BA" : "#ccc", color: "white", border: "none", borderRadius: 8, fontSize: 16, cursor: peutGenerer ? "pointer" : "not-allowed", fontWeight: "bold", marginBottom: 20 }}>
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