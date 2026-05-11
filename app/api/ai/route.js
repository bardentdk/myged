import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = (docs = []) => `Tu es l'Assistant Mar'my, intégré à la GED du CFA Horizon Réunion (Saint-Denis, La Réunion).

Tu aides à : retrouver et analyser des documents, préparer les audits Qualiopi (32 indicateurs), comparer des versions, identifier les pièces manquantes, générer des synthèses.

Documents dans la GED (${docs.length}) :
${docs.slice(0, 20).map(d =>
  `• [${d.id}] ${d.name} — ${d.type.toUpperCase()} | ${d.folder} | ${d.status} | v${d.version}${d.tags?.length ? ` | tags: ${d.tags.join(', ')}` : ''}${d.expires ? ` | expire: ${d.expires}` : ''}`
).join('\n')}

Réponds toujours en français. Sois précis et concis. Cite les documents par leur nom exact. Pour Qualiopi, référence les indicateurs par numéro. Propose des actions concrètes quand c'est pertinent.`;

function cannedResponse(text) {
  const p = text.toLowerCase();
  if (p.includes('manqu') && (p.includes('session') || p.includes('tp') || p.includes('appren'))) {
    return "J'ai analysé le dossier « TP Secrétaire Assistant 2026 » : 23 documents présents, 4 manquants.\n\n**Manquants :**\n- Émargements semaine 8\n- Attestation présence intervenant externe (Marie Técher)\n- Bilan intermédiaire mi-parcours\n- Fiche de positionnement — Jean Payet\n\nSouhaitez-vous que je génère les modèles correspondants ?";
  }
  if (p.includes('résume') || p.includes('résumé') || p.includes('resume')) {
    return "**Synthèse convention OPCO Akto v3.0 :**\n\n- Apprenant : Jean Payet — contrat de professionnalisation 12 mois\n- Coût horaire : 11,80 € (barème fév. 2026)\n- Volume : 805 heures, du 12/01 au 28/08/2026\n- Prise en charge : 9 499 € par OPCO Akto, dossier validé le 03/03/2026\n- Clause annexe : frais plafonnés à 350 €";
  }
  if (p.includes('compare') || p.includes('v2') || p.includes('version')) {
    return "**Différences v2.2 → v2.3 :**\n\n- Art. 1 : précision du niveau RNCP (n°36804)\n- Art. 2 : durée 720h → 805h, période étendue au 28/08\n- Art. 3 : mention barème OPCO Akto février 2026 ajoutée\n\nAucun changement sur les articles 4-12. Recommandation : notifier Mélanie Grondin pour mise à jour pédagogique.";
  }
  if (p.includes('qualiopi') || p.includes('indicateur') || p.includes('audit')) {
    return "**Indicateur 11 — Suivi des apprenants :**\n\n✅ Livret d'accueil 2026\n✅ Procédure d'évaluation\n✅ Grille de positionnement\n✅ Bilans intermédiaires\n✅ Statistiques assiduité Q1\n⚠️ Plan de remédiation (manquant)\n⚠️ Échantillon évaluations sommatives (manquant)\n\n2 pièces à fournir avant le 29 mars. Voulez-vous que je génère un modèle de plan de remédiation ?";
  }
  if (p.includes('expir') || p.includes('renouveler') || p.includes('échéance')) {
    return "**Documents expirant dans les 60 prochains jours :**\n\n1. **Assurance RC professionnelle** — expire 01/06/2026 (21 j)\n2. **Pièce identité — Jean Payet** — expire 12/06/2027 (34 j)\n3. **Convention OPCO Akto** — expire 01/09/2026 (35 j)\n\nRecommandation : lancer le renouvellement de l'assurance RC en priorité.";
  }
  return "Je peux explorer la GED, comparer des versions, vérifier la complétude d'un dossier Qualiopi ou préparer un export. Précisez la session, le document ou l'indicateur concerné.";
}

export async function POST(req) {
  const { messages, docs } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const lastMsg = messages[messages.length - 1]?.text || '';

  if (!apiKey || apiKey === 'your-key-here') {
    await new Promise((r) => setTimeout(r, 600));
    return Response.json({ content: cannedResponse(lastMsg) });
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT(docs || []),
      messages: messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })),
    });
    return Response.json({ content: response.content[0].text });
  } catch (err) {
    console.error('AI API error:', err);
    return Response.json({ content: cannedResponse(lastMsg) });
  }
}
