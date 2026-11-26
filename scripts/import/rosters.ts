/**
 * Official team lists from the client's final design (docs/KS_TIRANA_WEB_Final .pdf,
 * "Faqja e ekipit" pages). The club confirmed consent for everyone listed here
 * (2026-11-26), so `npm run import:rosters` publishes them.
 *
 * Disciplines are listed in the order of the design's "Disiplinat" grid.
 * `slug` must match disciplines.slug; new disciplines are created by the import.
 */

export type RosterDiscipline = {
  slug: string;
  name: { sq: string; en: string };
  staff: { name: string; role: "head_coach" | "assistant_coach"; title?: string }[];
  athletes: string[];
};

const T = "head_coach" as const;
const Z = "assistant_coach" as const;

export const ROSTERS: RosterDiscipline[] = [
  {
    slug: "not",
    name: { sq: "Not", en: "Swimming" },
    staff: [{ name: "Arjan Fetishaj", role: T }, { name: "Keis Fetishaj", role: Z }],
    athletes: ["Kaltra Meça", "Dastin Topi", "Julia Xhako", "Gersi Troka", "Juri Kapoli", "Arden Malaveci"],
  },
  {
    slug: "xhudo",
    name: { sq: "Judo", en: "Judo" },
    staff: [{ name: "Mariglen Çullhaj", role: T }, { name: "Fatlime Hasani", role: Z }],
    athletes: [
      "Aleksander Shaipi", "Jon Vrenozi", "Ejsi Ahmeti", "Dejvi Ceka", "Klevis Murati", "Desara Ndoci",
      "Erisa Brahimaj", "Luka Briçi", "Mateo Uku", "Indrit Çullhaj", "Ari Sineci",
    ],
  },
  {
    slug: "shah",
    name: { sq: "Shah", en: "Chess" },
    staff: [{ name: "Llambi Pasko", role: T }],
    athletes: ["Klean Shuqja", "Endrit Gallo", "Elvis Kola", "Mateu Boci"],
  },
  {
    slug: "mundje-e-lire",
    name: { sq: "Mundje e lirë", en: "Freestyle wrestling" },
    staff: [
      { name: "Leonard Çakmashi", role: T },
      { name: "Ermal Kryeziu", role: Z },
      { name: "Haxhi Sina", role: Z, title: "Trajner i grupmoshave" },
    ],
    athletes: [
      "Islam Dudaev", "Paris Karepi", "Endrio Abdyli", "Zelimkhan Abakarov", "Emiljano Onuzi", "Ibrahim Sula",
      "Chermen Valiev", "Albina Drazhi", "Albin Peposhi", "Orges Lila", "Elmaz Kryeziu", "Klajdi Lika",
      "Oltjan Bardhi", "Ajndi Kryeziu", "Ervis Bardhi",
    ],
  },
  {
    slug: "mundje-greko-romake",
    name: { sq: "Mundje greko-romake", en: "Greco-Roman wrestling" },
    staff: [{ name: "Oltion Karaj", role: T }],
    athletes: [
      "Julijan Shehu", "Boris Frrokaj", "Andis Kodra", "Bajram Sina", "Kevin Kupi", "Rejan Osmaj",
      "Klodjan Shehu", "Ergi Uku", "Marseld Sina", "Emiljano Tafa", "Mikel Troplini", "Ardit Zeneli",
    ],
  },
  {
    slug: "ciklizem",
    name: { sq: "Çiklizëm", en: "Cycling" },
    staff: [{ name: "Mejdin Malhani", role: T }],
    athletes: ["Marolino Hoxha", "Henri Hysa", "Olsian Velia"],
  },
  {
    slug: "qitje",
    name: { sq: "Qitje", en: "Shooting" },
    staff: [{ name: "Shpresa Kotrri", role: T }, { name: "Lumturi Pepa", role: Z }],
    athletes: ["Edlira Dingu", "Sevi Lamce", "Sibora Dingu", "Agim Ramo", "Fatjon Hoxha"],
  },
  {
    slug: "peshengritje",
    name: { sq: "Peshëngritje", en: "Weightlifting" },
    staff: [{ name: "Sokol Bishanaku", role: T }],
    athletes: [
      "Gerald Gulimaçi", "Briken Çalja", "Erkand Qerimaj", "Samuel Bishanaku", "Ardit Onuzi", "Sajmir Xhepa",
      "Kristi Ramadani", "Julia Ali Hasani",
    ],
  },
  {
    slug: "taekwondo",
    name: { sq: "Taekwondo", en: "Taekwondo" },
    staff: [{ name: "Arjola Kasaj", role: T }],
    athletes: ["Livia Zhegu", "Ernest Merdanaj", "Ibrahim Hidri", "Fjola Balliu", "Ergi Lika", "Kidlin Kasaj"],
  },
  {
    slug: "boks",
    name: { sq: "Boks", en: "Boxing" },
    staff: [{ name: "Renato Kurti", role: T }, { name: "Sead Bushati", role: Z }],
    athletes: ["Alban Beqiri", "Mehmet Hoda", "Aisi Mjalti", "Kris Bushi", "Pëllumb Çela", "Ergys Aliaj", "Riduan Gashi"],
  },
  {
    slug: "atletike",
    name: { sq: "Atletikë", en: "Athletics" },
    staff: [
      { name: "Rejnaldo Gjerazi", role: T },
      { name: "Liljana Gjerazi", role: Z },
      { name: "Taulant Stermasi", role: Z },
    ],
    athletes: [
      "Luiza Gega", "Iljana Beqiri", "Phoebe Mustafaraj", "Relaksa Dauti", "Paola Shyle", "Kristina Pura",
      "Redia Dauti", "Ejona Cufe", "Ajla Doda", "Alesia Dauti", "Yipsi Moreno Gonzalez", "Bledar Mesi", "Markelo Mema",
    ],
  },
  {
    slug: "volejboll-femra",
    name: { sq: "Volejboll femra", en: "Women's volleyball" },
    staff: [{ name: "Adrian Gorenca", role: T }, { name: "Blerdi Sinani", role: Z }],
    athletes: [
      "Enkeleda Xhija", "Ajla Brimi", "Desislava Todeva", "Paola Gjata", "Joana Kushi", "Ana Fasuleva",
      "Luljeta Stërmilla", "Adma Mikopula", "Reila Dashi", "Eni Fagu", "Nensi Veselaj", "Arba Abazi",
    ],
  },
  {
    slug: "volejboll-meshkuj",
    name: { sq: "Volejboll meshkuj", en: "Men's volleyball" },
    staff: [{ name: "Arben Sako", role: T }, { name: "Klodian Ferhati", role: Z }],
    athletes: [
      "Hendi Kono", "Kreshnik Malaj", "Ilir Hysa", "Gesti Kapidani", "Regis Shehi", "Charles Belvin", "Aldo Kupi",
      "Denis Demko", "Samet Akyildiz", "Emilijan Xhabrahimi", "Geri Stafa", "Juljan Talaj", "Rei Bala",
    ],
  },
  {
    slug: "basketboll-femra",
    name: { sq: "Basketboll femra", en: "Women's basketball" },
    staff: [{ name: "Mirza Alibegaj", role: T }, { name: "Roland Avrami", role: Z }],
    athletes: [
      "Izabel Kaçorri", "Najiyyah Yasmin Pack-Maddox", "Antea Filopati", "Ornela Lalaj",
      "Lovely Antionay Monique Sonnier", "Lorida Zhupi", "Ketjona Fekollari", "Irina Gjani", "Juri Sena", "Anja Kasa",
      "Hana Rryte", "Sibel Gjyzeli", "Enisa Qosja", "Emili Kaciqi", "Mele Katokala Finau",
    ],
  },
  {
    slug: "basketboll-meshkuj",
    name: { sq: "Basketboll meshkuj", en: "Men's basketball" },
    staff: [{ name: "Cosmin Gabriel Blagoi", role: T }, { name: "Red Vogli", role: Z }],
    athletes: [
      "Giseld Ndreca", "Aleksis Nika", "Brandon Nii Yemoh Laryea", "Klein Strazimiri", "Samuel Skëndaj",
      "Goanar Kok Beliew", "Aron Sharra", "Malik Labrone Madison", "Leonel Nasi", "Marvin Sharra", "Jaedon Elliott Willis",
    ],
  },
  // The design lists "Unknown" placeholders for tennis: roster to follow.
  { slug: "tenis", name: { sq: "Tenis", en: "Tennis" }, staff: [], athletes: [] },
  {
    slug: "karate",
    name: { sq: "Karate", en: "Karate" },
    staff: [{ name: "Murat Basha", role: T }],
    athletes: ["Bekim Basha", "Rigers Rami", "Ernik Pjetri", "Neevis Hasani"],
  },
  {
    slug: "pingpong",
    name: { sq: "Ping-pong", en: "Table tennis" },
    staff: [{ name: "Hatije Tufa", role: T }],
    athletes: ["Jonuz Tufa", "Grigorio Janku", "Ilia Koto", "Kejdi Kalaja"],
  },
  {
    slug: "mma",
    name: { sq: "MMA", en: "MMA" },
    staff: [{ name: "Mariglen Burreli", role: T }],
    athletes: ["Ertis Merkoçi", "Ted Shabani"],
  },
  {
    slug: "bilardo",
    name: { sq: "Bilardo", en: "Billiards" },
    staff: [{ name: "Ylli Gordani", role: T }],
    athletes: ["Besar Spahiu", "Dorjan Maknori"],
  },
];
