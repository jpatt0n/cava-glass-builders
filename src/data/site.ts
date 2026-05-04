// Single source of truth for site copy. Edit here, AI agents and humans alike.

export const site = {
  name: "Cava Glass Builders",
  domain: "cavaglassbuilders.com",
  tagline: "Premium Interior Glass for Custom Builders & Homes",
  shortDescription:
    "Custom shower enclosures, mirrors, and interior glass — designed and installed for Houston's leading builders, designers, and high-end residences.",
  contact: {
    email: "cavaglassbuilders@gmail.com",
    phone: "936-230-9991",
    phoneHref: "tel:+19362309991",
    location: "Heights, Houston",
    serviceArea: "Greater Houston & surrounding areas",
  },
  founded: 2022,
  yearsExperience: "10+",
  warranty: "1-Year Workmanship Warranty",
} as const;

export const services = [
  {
    id: "showers",
    title: "Shower Enclosures",
    summary:
      "Frameless, semi-frameless, and fully custom enclosures engineered to fit unconventional spaces with precision hardware in matte black, brushed brass, brushed nickel, and chrome.",
    bullets: [
      "Frameless heavy glass (3/8\" & 1/2\")",
      "Semi-frameless and framed systems",
      "Steam shower & sauna enclosures",
      "Custom geometry — neo-angle, inline, and curved",
    ],
    image: "shower-frameless-brass",
  },
  {
    id: "mirrors",
    title: "Mirrors",
    summary:
      "Vanity, full-wall, gym, and back-painted mirror installations — cut, polished, and installed to architectural tolerances. Anti-fog and LED-integrated options.",
    bullets: [
      "Full-wall and floor-to-ceiling installs",
      "Custom-framed vanity mirrors",
      "Anti-fog and back-lit (LED) mirrors",
      "Mirror backsplashes and feature walls",
    ],
    image: "mirror-fullwall",
  },
  {
    id: "interior-glass",
    title: "Interior Glass",
    summary:
      "Glass partitions, walls, doors, railings, shelving, and wine room enclosures. Architectural glass that defines space without closing it off.",
    bullets: [
      "Glass partitions, walls, and office fronts",
      "Frameless glass railings and balustrades",
      "Glass shelving and display cases",
      "Wine room and steel-frame doors",
    ],
    image: "glass-wine-room",
  },
] as const;

export const audiences = [
  {
    title: "Home Builders, Remodelers & Designers",
    body: "We make B2B partnership simple — builder pricing, dependable scheduling, and custom-quality installations. Thousands of completed projects across every neighborhood in Houston.",
  },
  {
    title: "Multifamily & Hotels",
    body: "Project-management discipline, priority submittals, and clean punch-out. We design, supply, and install the shower doors and mirrors right the first time and on-time.",
  },
  {
    title: "High-End Residential",
    body: "Custom shower enclosures, steam rooms, saunas, and wine rooms for Houston's most considered homes — in close coordination with the architect, designer, and homeowner.",
  },
] as const;

export const stats = [
  { value: "10+", label: "Years in the Industry" },
  { value: "1,000+", label: "Completed Installations" },
  { value: "1-Year", label: "Workmanship Warranty" },
  { value: "Houston", label: "& Surrounding Areas" },
] as const;

export const serviceArea = [
  "The Woodlands",
  "Cypress",
  "Katy",
  "Memorial",
  "River Oaks",
  "Heights",
  "Sugar Land",
  "Missouri City",
  "Pearland",
  "Friendswood",
  "League City",
] as const;

export const showcase = [
  { image: "hero-spa-bath", alt: "Spa-style master bath with frameless shower and freestanding tub", category: "Shower" },
  { image: "shower-walkin-marble", alt: "Frameless walk-in shower with marble surround", category: "Shower" },
  { image: "shower-marble-matte", alt: "Marble shower with matte-black sliding hardware", category: "Shower" },
  { image: "shower-frameless-brass", alt: "Frameless shower with brushed-brass hardware", category: "Shower" },
  { image: "mirror-vanity", alt: "Custom-framed vanity mirror in primary bath", category: "Mirror" },
  { image: "mirror-backsplash", alt: "Mirror backsplash in butler's pantry", category: "Mirror" },
  { image: "mirror-fullwall", alt: "Full-wall gym mirror installation", category: "Mirror" },
  { image: "glass-wine-room", alt: "Glass-front wine room with backlit display", category: "Interior Glass" },
  { image: "glass-rain-partition", alt: "Textured rain glass privacy partition", category: "Interior Glass" },
  { image: "shower-sliding-subway", alt: "Sliding glass shower over tub with subway tile", category: "Shower" },
] as const;
