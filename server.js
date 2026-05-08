const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/generer', async (req, res) => {
  const { description, plateforme, ton, image } = req.body;
  try {
    const contenu = [];

    if (image) {
      contenu.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: image.type,
          data: image.data,
        }
      });
    }

    contenu.push({
      type: 'text',
      text: `Tu es un expert en vente sur ${plateforme}. Ton de l'annonce : ${ton}.
${image ? "Analyse cette photo et génère une annonce optimisée pour l'article que tu vois." : `Genere une annonce pour : "${description}".`}

Reponds UNIQUEMENT avec ce JSON sans texte avant ou apres :
{
  "titre": "titre accrocheur max 60 caracteres",
  "description": "description vendeuse de 3-4 lignes",
  "prix": "prix suggere en chiffre uniquement ex: 25",
  "prix_min": "prix minimum recommande en chiffre",
  "prix_max": "prix maximum recommande en chiffre",
  "prix_psychologique": "prix psychologique recommande ex: 24.99",
  "mots_cles": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "concurrence": "faible ou moyenne ou forte",
  "delai_vente": "estimation ex: 2-3 jours",
  "meilleur_moment": "ex: Mardi ou Mercredi soir",
  "meilleure_plateforme": "Vinted ou Leboncoin ou Les deux",
  "photos": ["conseil photo 1", "conseil photo 2", "conseil photo 3"],
  "erreurs": ["erreur a eviter 1", "erreur a eviter 2"],
  "score": 8,
  "points_forts": ["point fort 1", "point fort 2"],
  "points_amelioration": ["amelioration 1", "amelioration 2"]
}`
    });

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{ role: 'user', content: contenu }]
    });

    const texte = message.content[0].text;
    console.log('Reponse:', texte);
    const json = JSON.parse(texte.replace(/```json|```/g, '').trim());
    res.json(json);
  } catch (error) {
    console.log('ERREUR:', error.message);
    res.status(500).json({ erreur: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Serveur demarre sur le port ' + PORT));