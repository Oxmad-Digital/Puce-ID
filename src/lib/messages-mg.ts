import type { Lang } from "@/components/layout/lang-toggle";

/**
 * Traduction malgache des messages renvoyés par les Server Actions.
 * Les actions répondent en français ; l'affichage côté client les traduit ici.
 */
const EXACT: Record<string, string> = {
  // Compte
  "Indiquez votre nom complet": "Ampidiro ny anaranao feno",
  "Adresse e-mail invalide": "Adiresy mailaka tsy mety",
  "Indiquez un numéro de téléphone": "Ampidiro ny laharan-telefaonina",
  "Vous devez accepter les CGU": "Tsy maintsy ekenao ny fepetra ankapobeny fampiasana",
  "Les mots de passe ne correspondent pas": "Tsy mitovy ireo teny miafina",
  "Indiquez le nom de votre clinique": "Ampidiro ny anaran'ny toeram-pitsaboanao",
  "Indiquez votre numéro d'ordre": "Ampidiro ny laharanao ao amin'ny Holafitra (Ordre)",
  "Indiquez votre ville d'exercice": "Ampidiro ny tanàna iasanao",
  "La création du compte a échoué. Réessayez dans un instant.":
    "Tsy nahomby ny famoronana kaonty. Andramo indray afaka kelikely.",
  "Indiquez votre nom": "Ampidiro ny anaranao",
  "Profil mis à jour.": "Voavao ny mombamomba anao.",
  "Mot de passe modifié. Vos autres sessions ont été déconnectées.":
    "Voaova ny teny miafina. Nivoahana ireo fidiranao hafa rehetra.",
  "Compte introuvable. Contactez le support.": "Tsy hita ny kaonty. Mifandraisa amin'ny fanohanana.",
  "Mot de passe enregistré. Bienvenue sur Puce ID !": "Voatahiry ny teny miafina. Tongasoa eto amin'ny Puce ID !",

  // Animaux
  "Indiquez le nom de l'animal": "Ampidiro ny anaran'ny biby",
  "Choisissez l'espèce": "Safidio ny karazany",
  "Le numéro de puce doit comporter exactement 15 chiffres": "Tsy maintsy misy isa 15 marina ny laharan'ny puce",
  "Indiquez le nom du propriétaire": "Ampidiro ny anaran'ny tompony",
  "Votre compte vétérinaire doit être vérifié avant de pouvoir enregistrer des animaux.":
    "Tsy maintsy hamarinina aloha ny kaontinao dokotera mpitsabo biby vao afaka manoratra biby.",
  "Vous ne pouvez pas modifier cette fiche.": "Tsy afaka manova ity fiche ity ianao.",
  "Seul le propriétaire peut déclarer son animal disparu.": "Ny tompony ihany no afaka manambara fa very ny bibiny.",
  "Action non autorisée.": "Tsy nahazoana alalana.",
  "Le décès a été enregistré.": "Voasoratra ny fahafatesana.",
  "Réservé aux vétérinaires vérifiés.": "Natokana ho an'ny dokotera mpitsabo biby voamarina ihany.",
  "Indiquez le nom du nouveau propriétaire": "Ampidiro ny anaran'ny tompony vaovao",
  "Vous ne pouvez pas transférer cet animal.": "Tsy afaka mamindra ity biby ity ianao.",
  "Un transfert est déjà en attente pour cet animal.": "Efa misy famindrana miandry ho an'ity biby ity.",
  "Seuls le propriétaire et la clinique responsable peuvent changer de clinique.":
    "Ny tompony sy ny toeram-pitsaboana tompon'andraikitra ihany no afaka manova toeram-pitsaboana.",
  "Un changement de clinique est déjà en attente pour cet animal.":
    "Efa misy fiovana toeram-pitsaboana miandry ho an'ity biby ity.",

  // Cliniques
  "Un compte existe déjà avec cette adresse.": "Efa misy kaonty mampiasa io adiresy io.",
  "Ce compte est déjà activé.": "Efa mandeha io kaonty io.",
  "L'e-mail d'invitation n'a pas pu être envoyé. Réessayez dans quelques minutes.":
    "Tsy lasa ny mailaka fanasana. Andramo indray afaka minitra vitsivitsy.",
  "Vétérinaire introuvable.": "Tsy hita ny dokotera mpitsabo biby.",
  "Indiquez le nom de la clinique": "Ampidiro ny anaran'ny toeram-pitsaboana",
  "Indiquez la ville": "Ampidiro ny tanàna",
  "Seul le responsable de la clinique peut modifier ces informations.":
    "Ny tompon'andraikitry ny toeram-pitsaboana ihany no afaka manova ireo fampahalalana ireo.",
  "Informations de la clinique mises à jour.": "Voavao ny fampahalalana momba ny toeram-pitsaboana.",
  "Indiquez le nom du vétérinaire": "Ampidiro ny anaran'ny dokotera mpitsabo biby",
  "Indiquez le numéro d'ordre": "Ampidiro ny laharana ao amin'ny Holafitra (Ordre)",
  "Réservé à l'administration.": "Natokana ho an'ny mpitantana ihany.",
  "Seul le responsable de la clinique peut inviter des confrères.":
    "Ny tompon'andraikitry ny toeram-pitsaboana ihany no afaka manasa mpiara-miasa.",
  "Clinique introuvable.": "Tsy hita ny toeram-pitsaboana.",

  // Public
  "Indiquez un téléphone ou un e-mail pour être recontacté":
    "Ampidiro telefaonina na mailaka ahafahana miverina mifandray aminao",
  "Votre message est trop court": "Fohy loatra ny hafatrao",
  "Aucun animal n'est enregistré avec ce numéro de puce.": "Tsy misy biby voasoratra amin'io laharan'ny puce io.",
  "Votre message a été transmis au propriétaire. Merci pour votre aide !":
    "Lasa any amin'ny tompony ny hafatrao. Misaotra noho ny fanampianao !",
  "Indiquez un téléphone ou un e-mail": "Ampidiro telefaonina na mailaka",
  "Expliquez la situation en quelques phrases": "Hazavao amin'ny fehezanteny vitsivitsy ny zava-misy",
  "Votre contestation a été enregistrée. Notre équipe vous recontactera sous 72 h ouvrées.":
    "Voasoratra ny fanoheranao. Hifandray aminao ao anatin'ny 72 ora fiasana ny ekipanay.",
  "Le numéro de puce doit comporter 15 chiffres": "Tsy maintsy misy isa 15 ny laharan'ny puce",
  "Précisez l'espèce": "Lazao ny karazany",
  "Indiquez le lieu": "Ampidiro ny toerana",
  "Indiquez la date": "Ampidiro ny daty",
  "Décrivez l'animal (couleur, collier, signes particuliers…)":
    "Lazalazao ny biby (loko, rojo an-tenda, mari-panondro manokana…)",
  "Signalement enregistré : la puce correspond à un animal du registre, son propriétaire est prévenu.":
    "Voasoratra ny filazana : mifanaraka amin'ny biby iray ao amin'ny rejisitra ny puce, efa nampahafantarina ny tompony.",
  "Signalement enregistré et publié dans les annonces Perdu / Trouvé.":
    "Voasoratra ny filazana ary navoaka tao amin'ny filazana Very / Hita.",
  "Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.":
    "Misaotra ! Lasa ny hafatrao, hamaly anao haingana izahay.",

  // Import CSV
  "Votre compte doit être vérifié pour importer des animaux.":
    "Tsy maintsy voamarina ny kaontinao vao afaka manafatra biby.",
  "Choisissez un fichier CSV.": "Misafidiana rakitra CSV.",
  "Fichier trop volumineux (2 Mo maximum).": "Lehibe loatra ny rakitra (2 Mo farafahabetsany).",
  "Le fichier ne contient aucune ligne de données.": "Tsy misy andalana angona ao amin'ny rakitra.",
  "Nom, espèce ou propriétaire manquant": "Tsy misy ny anarana, ny karazany na ny tompony",
  "Puce présente deux fois dans le fichier": "Indroa ao amin'ny rakitra ny puce",
  "Aucune ligne valide à importer.": "Tsy misy andalana mety hafarana.",

  // Envoi de fichiers
  "Échec de l'envoi": "Tsy lasa ny rakitra",
  "Le stockage a refusé le fichier": "Nolavin'ny fitehirizana ny rakitra",
  "Requête invalide": "Fangatahana tsy mety",
  "Connexion requise": "Mila miditra aloha",
  "Format de fichier non accepté": "Tsy ekena ny endriky ny rakitra",

  // Connexion / mot de passe (better-auth)
  "Invalid email or password": "Diso ny mailaka na ny teny miafina",
};

/** Messages contenant des valeurs dynamiques. */
const PATTERNS: [RegExp, (...m: string[]) => string][] = [
  [
    /^(.+) est déclaré disparu\. L'alerte est visible par toute personne qui scanne sa puce\.$/,
    (n) => `Nambara fa very i ${n}. Hitan'izay rehetra mi-scan ny puce-ny ny fampitandremana.`,
  ],
  [
    /^Invitation envoyée à (.+)\. Le transfert sera effectif après son acceptation\.$/,
    (n) => `Nalefa tany amin'i ${n} ny fanasana. Hihatra ny famindrana rehefa nekeny.`,
  ],
  [/^(.+) est désormais suivi par (.+)\.$/, (a, c) => `${c} no manaraka an'i ${a} manomboka izao.`],
  [
    /^Demande de transfert vers (.+) envoyée\. Le changement sera effectif après validation par l'administration\.$/,
    (c) => `Nalefa ny fangatahana famindrana any amin'ny ${c}. Hihatra ny fiovana rehefa nankatoavin'ny mpitantana.`,
  ],
  [/^Invitation envoyée à (.+)\.$/, (n) => `Nalefa tany amin'i ${n} ny fanasana.`],
  [/^Fichier trop volumineux \(max (\d+) Mo\)$/, (n) => `Lehibe loatra ny rakitra (${n} Mo farafahabetsany)`],
  [
    /^Le compte de (.+) a été créé, mais l'e-mail d'invitation n'a pas pu être envoyé\. Réessayez plus tard avec « Renvoyer l'invitation »\.$/,
    (n) => `Voaforona ny kaontin'i ${n}, saingy tsy lasa ny mailaka fanasana. Andramo indray any aoriana amin'ny « Alefaso indray ny fanasana ».`,
  ],
  [/^Invitation renvoyée à (.+)\.$/, (e) => `Nalefa indray tany amin'i ${e} ny fanasana.`],
  [
    /^Statut de (.+) mis à jour, mais l'e-mail de notification n'a pas pu lui être envoyé\.$/,
    (n) => `Voavao ny toetran'i ${n}, saingy tsy lasa tany aminy ny mailaka fampahafantarana.`,
  ],
  [
    /^La demande de transfert est enregistrée, mais l'e-mail n'a pas pu être envoyé à (.+)\. Prévenez-le directement : il pourra accepter depuis « Transferts » une fois connecté\.$/,
    (n) => `Voasoratra ny fangatahana famindrana, saingy tsy lasa tany amin'i ${n} ny mailaka. Ampahafantaro mivantana izy : afaka manaiky ao amin'ny « Famindrana » izy rehefa miditra.`,
  ],
  [
    /^(\d+) invitations? n'(?:ont|a) pas pu être envoyées? par e-mail : les comptes sont créés, contactez l'administration pour les renvoyer\.$/,
    (n) => `Fanasana ${n} no tsy lasa tamin'ny mailaka : voaforona ny kaonty, mifandraisa amin'ny mpitantana mba handefa azy indray.`,
  ],
  [/^Colonne obligatoire manquante : (.+)$/, (c) => `Tsy hita ny tsanganana tsy maintsy misy : ${c}`],
  [/^Numéro de puce invalide \((.*)\)$/, (c) => `Laharan'ny puce tsy mety (${c === "vide" ? "foana" : c})`],
  [/^Puce (.+) déjà enregistrée — ignorée$/, (c) => `Efa voasoratra ny puce ${c} — tsy noraisina`],
  [
    /^(\d+) animaux? importés?\.(?: (\d+) propriétaires? (?:ont|a) reçu une invitation par e-mail\.)?$/,
    (n, i) => `Biby ${n} voafatra.` + (i ? ` Tompona biby ${i} no nahazo fanasana tamin'ny mailaka.` : ""),
  ],
];

export function translateMessage(message: string | undefined, lang: Lang) {
  if (!message || lang === "fr") return message;
  if (EXACT[message]) return EXACT[message];
  for (const [re, fn] of PATTERNS) {
    const m = message.match(re);
    if (m) return fn(...m.slice(1));
  }
  return message;
}
