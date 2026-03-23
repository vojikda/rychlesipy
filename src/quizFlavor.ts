/** Hlášky podle skóre a tituly po kole – téma Rychlé šípy / parta. */

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)]!;
}

/** Krátká hláška podle aktuálního skóre během hry. */
export function pickScoreQuip(score: number): string {
  if (score <= -8) {
    return pick([
      "Stínadla ti teď moc nefandí…",
      "Tohle by Rychlonožka okomentoval jen povzdechem.",
      "Je čas se vzchopit – ještě to není konec kola!",
      "Jako by tě Mažňák málem dostihl v uličce.",
    ]);
  }
  if (score < 0) {
    return pick([
      "Mínusy bolí, ale pořád jsi v boji.",
      "Zvedni hlavu – další otázka může být tvoje.",
      "I Mirek občas šlápl vedle. No, skoro.",
      "Ještě to zvrátit – věř si.",
    ]);
  }
  if (score === 0) {
    return pick([
      "Na nule – čistý stůl, čistá šance.",
      "Startovní rovina. Ukáž, co v tobě je.",
      "Nic neztratil, nic nezískal… zatím.",
    ]);
  }
  if (score <= 5) {
    return pick([
      "Jde ti to – drž ten rytmus!",
      "Pěkně, šípy letí tam, kam mají.",
      "Klubová úroveň: solidní.",
      "Tohle by v Tam-Tamu mohlo být na první straně.",
    ]);
  }
  if (score <= 10) {
    return pick([
      "Forma jako z učebnice – pokračuj!",
      "Dušín by přikývl. Možná i dvakrát.",
      "Stínadla ti tleskají (tiše, ale tleskají).",
      "Výborně, jsi v laufu!",
    ]);
  }
  if (score <= 15) {
    return pick([
      "Brutální série – respekt!",
      "Takhle se drží parta pohromadě.",
      "Kronikář by z toho udělal celou kapitolu.",
      "Skoro jako zlatý věk klubu!",
    ]);
  }
  if (score < 20) {
    return pick([
      "Už skoro legenda – ještě pár cílů!",
      "Tohle je výkon na titulní stránku.",
      "Klobouk dolů – nebo šíp vzhůru?",
    ]);
  }
  return pick([
    "Perfektní kolo – legenda Stínadel!",
    "Všechno sedlo. Mirek by byl hrdý.",
    "Plný počet – víc už to nejde!",
  ]);
}

export type ResultTitle = { title: string; subtitle: string };

/** Titul a podtitul na výsledkové obrazovce podle finálního skóre. */
export function getResultTitle(score: number, questionCount: number): ResultTitle {
  if (questionCount <= 0) {
    return { title: "Bez kola", subtitle: "Přidej otázky a zkus to znovu." };
  }
  const max = questionCount;

  if (score === max) {
    return {
      title: "Legenda Stínadel",
      subtitle: "Plný počet bodů – klobouk dolů, mistře kvízu!",
    };
  }

  if (score <= -12) {
    return {
      title: "Potulný Vont",
      subtitle: "Dnes to nebyl tvůj den – zítra to Stínadla zkusí znovu.",
    };
  }
  if (score < -5) {
    return {
      title: "Hlídka z Děravé boudy",
      subtitle: "Držíš se při zemi, ale pořád patříš do party.",
    };
  }
  if (score < 0) {
    return {
      title: "Člen na zkoušku",
      subtitle: "Něco málo do mínusu – příště to otočíš.",
    };
  }
  if (score === 0) {
    return {
      title: "Rovnovážný šíp",
      subtitle: "Přesně na nule – ani bonus, ani škoda.",
    };
  }

  const ratio = score / max;
  if (ratio >= 0.85) {
    return {
      title: "Zlatý šíp",
      subtitle: "Špičková forma – jen kousek od plného počtu!",
    };
  }
  if (ratio >= 0.5) {
    return {
      title: "Stříbrný šíp",
      subtitle: "Solidní výkon – v Tam-Tamu bys měl rubriku.",
    };
  }
  return {
    title: "Bronzový šíp",
    subtitle: "Slušný rozjezd, klub tě bere.",
  };
}
