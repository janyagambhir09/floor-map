// The Floor — London tech ecosystem data

const BOROUGH_BLURBS = {
  "Camden": "London's Knowledge Quarter. Granary Square, Coal Drops Yard and the UCL spine — Phoenix Court anchors early-stage venture and the borough hosts more research institutes than any other in the UK.",
  "Islington": "Quiet investor row. Independent VCs and family offices keep their letterheads on Upper Street while their term sheets touch nearly every UK seed round.",
  "Hackney": "Hardware lofts, devtools and the loudest founder community in the city. Shoreditch warehouses by night, Broadway Market by Saturday morning — most AI hack nights in London still happen in E2.",
  "Tower Hamlets": "Two ecosystems on one borough. Whitechapel is life-sciences and clinical ML beside the Royal London; Canary Wharf is fintech-at-scale, Level-39 and the sovereign-cloud GPU operators that moved into the towers.",
  "Newham": "Olympic legacy turned innovation district. UCL East, Plexal and Here East sit behind the Stratford box — climate hardware and manufacturing pilots get tested up the Lea.",
  "Greenwich": "Maritime and space. Naval-grade autonomy, satellite ground-stations on the peninsula and robotics labs in the shadow of the Royal Observatory.",
  "Lewisham": "Suburban scale-up territory. EdTech, last-mile logistics and the first bench of climate-resilience startups working with the borough as a live test bed.",
  "Southwark": "Borough Market by day, design-tech studios by night. Bermondsey arches host robotics garages and food-tech kitchens; Peckham hosts generative artists and indie game studios.",
  "Lambeth": "Civic-tech and Black-led founder networks. The South Bank cluster sits on top of three of the country's open-data programmes; Brixton runs the most prolific maker school south of the river.",
  "Wandsworth": "Battersea Power Station turned tech-campus, plus the family-friendly founder belt. Climate hardware, energy software and the exited engineering leads who write back-channel angel cheques into central.",
  "Kensington and Chelsea": "Where European fintech grew up. Imperial spinouts, advanced-materials labs and the legacy VCs whose Portobello pubs still seat the partners that underwrote the first wave.",
  "Westminster": "Government-tech to the south, capital to the north. Whitehall departments and policy-AI labs sit a fifteen-minute walk from Mayfair growth funds and Soho creative-tools studios.",
  "Hammersmith and Fulham": "Media-tech and the new Imperial White City campus. Streaming infrastructure, broadcast graphics and a growing bench of biomed spinouts.",
  "City of London": "The fintech rails. Capital-markets infrastructure, regtech, audit-grade ledgering and the trading-systems engineers who quietly run the country's plumbing."
};

const GENERIC_OUTER_BLURB =
  "Outer London — quieter on the surface, but the alumni-list density is real. Most of the operators and angels who fund central live out here on weekdays.";

const CATEGORIES = [
  { id: "institution", label: "Institution",  symbol: "filledCircle" },
  { id: "community",   label: "Community",    symbol: "openCircle" },
  { id: "investor",    label: "Investor",     symbol: "filledSquare" },
  { id: "company",     label: "Company",      symbol: "openSquare" },
  { id: "person",      label: "Person",       symbol: "diamond" }
];

const PROJECTS = [
  { id: "phoenix_court", host: true,
    name: "Phoenix Court", inst: "The Floor / 08 May 2026",
    borough: "Camden", latlng: [51.5346, -0.1257],
    blurb: "The host. Early-stage venture firm — and tonight the venue for The Floor.",
    tags: ["venue", "vc", "networking"],
    website: "https://thefloor.london"
  },

  { id: "open_climate_atlas", category: "institution",
    name: "Open Climate Atlas", inst: "UCL Energy Institute",
    borough: "Camden", latlng: [51.5279, -0.1326],
    blurb: "Open-source dataset stitching together UK building emissions block by block. Used by every retrofit underwriter that matters.",
    tags: ["climate", "data", "research"]
  },
  { id: "whitechapel_ai", category: "institution",
    name: "Whitechapel AI Lab", inst: "Queen Mary · Bart's",
    borough: "Tower Hamlets", latlng: [51.5189, -0.0593],
    blurb: "Clinical-grade ML for the NHS, trained on the largest non-US health record. Quietly upstream of half the UK's diagnostic pilots.",
    tags: ["health", "ai", "research"]
  },
  { id: "greenwich_robotics", category: "institution",
    name: "Greenwich Robotics", inst: "Univ of Greenwich",
    borough: "Greenwich", latlng: [51.4825, 0.0050],
    blurb: "Maritime autonomy and uncrewed-surface-vessel research. Tests in the Thames before they go to the North Sea.",
    tags: ["robotics", "maritime", "research"]
  },
  { id: "bloomsbury_bio", category: "institution",
    name: "Bloomsbury BioFoundry", inst: "Crick · UCL",
    borough: "Camden", latlng: [51.5246, -0.1340],
    blurb: "A shared wet-lab where eight early biotechs run protein assays beside each other. The unofficial cafeteria of London life-sciences.",
    tags: ["biotech", "lab", "research"]
  },
  { id: "imperial_white_city", category: "institution",
    name: "I-X Imperial", inst: "White City Campus",
    borough: "Hammersmith and Fulham", latlng: [51.5135, -0.2243],
    blurb: "Imperial's interdisciplinary AI / robotics campus. Spinouts emerge faster than the building can be wayfinding-signed.",
    tags: ["ai", "robotics", "university"]
  },

  { id: "brixton_maker", category: "community",
    name: "Brixton Maker Lab", inst: "Lambeth Community Tech",
    borough: "Lambeth", latlng: [51.4628, -0.1141],
    blurb: "Makerspace and free hardware school for South London. Saturday classes turn over more soldering irons than most universities.",
    tags: ["hardware", "maker", "education"]
  },
  { id: "east_london_founders", category: "community",
    name: "East London Founders", inst: "EC2 · Volunteer-run",
    borough: "Hackney", latlng: [51.5260, -0.0775],
    blurb: "Weekly founder dinners hosted in turn by an alumni list of nine hundred. Famously harder to get on than a fund.",
    tags: ["founders", "networking", "community"]
  },
  { id: "camden_code_club", category: "community",
    name: "Camden Code Club", inst: "Roundhouse Studios",
    borough: "Camden", latlng: [51.5430, -0.1493],
    blurb: "Free Saturday programming clubs for under-18s. Several alumni have already taken seed rounds; a few have already exited.",
    tags: ["education", "coding", "youth"]
  },
  { id: "stratford_spark", category: "community",
    name: "Stratford Spark", inst: "Plexal · Here East",
    borough: "Newham", latlng: [51.5462, -0.0243],
    blurb: "Climate and hardware founder community for the East. Monthly demo nights inside one of the old broadcast studios.",
    tags: ["climate", "hardware", "community"]
  },
  { id: "peckham_pixel", category: "community",
    name: "Peckham Pixel", inst: "Copeland Park",
    borough: "Southwark", latlng: [51.4720, -0.0696],
    blurb: "Generative-art collective with a residency programme. Every other show ends in a commercial commission for a London studio.",
    tags: ["art", "generative", "creative"]
  },
  { id: "lambeth_loop", category: "community",
    name: "Lambeth Loop", inst: "Civic-tech Coalition",
    borough: "Lambeth", latlng: [51.4942, -0.1147],
    blurb: "Civic technologists meeting around government data. The borough has run small grants through the Loop for three years.",
    tags: ["civic", "data", "government"]
  },

  { id: "chelsea_capital", category: "investor",
    name: "Chelsea Capital", inst: "Series B · Climate, Robotics",
    borough: "Kensington and Chelsea", latlng: [51.4920, -0.1825],
    blurb: "Growth fund focused on industrial-software deeptech. Their portfolio quietly powers most of the UK's continuous-emissions monitoring.",
    tags: ["vc", "climate", "deeptech"]
  },
  { id: "islington_index", category: "investor",
    name: "Islington Index", inst: "Pre-seed · Generalist",
    borough: "Islington", latlng: [51.5440, -0.1023],
    blurb: "Solo-GP fund with a 48-hour decision rule. Cuts cheques smaller than the average angel but lands on every cap table in N1.",
    tags: ["vc", "pre-seed", "generalist"]
  },
  { id: "mayfair_method", category: "investor",
    name: "Mayfair Method", inst: "Multi-stage · Fintech",
    borough: "Westminster", latlng: [51.5095, -0.1455],
    blurb: "Late-stage capital for European fintech. Most of the firm's analysts came up inside the trading floors three streets away.",
    tags: ["vc", "fintech", "growth"]
  },
  { id: "hampstead_holdings", category: "investor",
    name: "Hampstead Holdings", inst: "Family Office · Deep-tech",
    borough: "Camden", latlng: [51.5582, -0.1772],
    blurb: "Patient capital for ten-year science bets. Two Nobel-winning labs run on a Hampstead Holdings underwrite right now.",
    tags: ["family-office", "deeptech", "science"]
  },
  { id: "rotherhithe_riverside", category: "investor",
    name: "Riverside Ventures", inst: "Seed · ML Infra",
    borough: "Southwark", latlng: [51.5022, -0.0480],
    blurb: "ML-infra specialist fund staffed almost entirely by ex-research engineers. Reads the model card before the deck.",
    tags: ["vc", "ml", "infra"]
  },

  { id: "canary_compute", category: "company",
    name: "Canary Compute", inst: "GPU Infrastructure",
    borough: "Tower Hamlets", latlng: [51.5054, -0.0235],
    blurb: "London-based sovereign-cloud provider for regulated workloads. The only UK company offering H-class GPUs inside an on-shore audit boundary.",
    tags: ["gpu", "cloud", "infrastructure"]
  },
  { id: "soho_synth", category: "company",
    name: "Soho Synth", inst: "Generative Audio",
    borough: "Westminster", latlng: [51.5135, -0.1335],
    blurb: "Real-time generative audio for film and games. Their plug-in shipped on three of last year's biggest soundtracks.",
    tags: ["audio", "generative", "media"]
  },
  { id: "hackney_hardware", category: "company",
    name: "Hackney Hardware", inst: "Wearable Health",
    borough: "Hackney", latlng: [51.5450, -0.0573],
    blurb: "Continuous biomarker wearable, designed and assembled in a Mare Street workshop. CE-marked since last spring.",
    tags: ["health", "wearable", "hardware"]
  },
  { id: "southwark_studio", category: "company",
    name: "Southwark Studio", inst: "Generative Design",
    borough: "Southwark", latlng: [51.4995, -0.0905],
    blurb: "CAD-meets-LLM for industrial design. Quietly licensed inside two FTSE-100 product teams.",
    tags: ["design", "ai", "cad"]
  },
  { id: "bermondsey_build", category: "company",
    name: "Bermondsey Build", inst: "Construction Robotics",
    borough: "Southwark", latlng: [51.4940, -0.0635],
    blurb: "Mobile robots that lay services in new buildings. Speaks more BIM than English.",
    tags: ["robotics", "construction", "automation"]
  },
  { id: "battersea_battery", category: "company",
    name: "Battersea Battery", inst: "Grid Storage",
    borough: "Wandsworth", latlng: [51.4795, -0.1632],
    blurb: "Long-duration storage software riding on retired EV cells. Has a contract with the new Power Station data centre across the road.",
    tags: ["energy", "storage", "climate"]
  },
  { id: "deptford_dsp", category: "company",
    name: "Deptford DSP", inst: "Edge Audio Silicon",
    borough: "Lewisham", latlng: [51.4790, -0.0265],
    blurb: "Tiny audio inference chips designed in a creekside studio. Two hearing-aid OEMs have signed long-term supply.",
    tags: ["silicon", "audio", "edge"]
  },
  { id: "city_ledger", category: "company",
    name: "City Ledger", inst: "RegTech",
    borough: "City of London", latlng: [51.5145, -0.0905],
    blurb: "Audit-ready ledgering for digital assets. Three of the four UK clearing banks now write transactions through it.",
    tags: ["fintech", "regtech", "ledger"]
  },

  { id: "p_daria", category: "person",
    name: "Daria Petrov", inst: "Founder · Climate ML",
    borough: "Camden", latlng: [51.5395, -0.1174],
    blurb: "Two-time founder, now between companies. Her last exit underwrote three of London's most prolific seed funds.",
    tags: ["founder", "climate", "ml"]
  },
  { id: "p_marcus", category: "person",
    name: "Marcus Chen", inst: "Engineer · Compilers",
    borough: "Hackney", latlng: [51.5304, -0.0732],
    blurb: "Compiler engineer turned independent researcher. Maintains the toolchain inside a third of London's ML-infra startups.",
    tags: ["engineer", "compilers", "ml"]
  },
  { id: "p_aisha", category: "person",
    name: "Aisha Khan", inst: "Designer · Civic Tools",
    borough: "Lambeth", latlng: [51.4675, -0.1175],
    blurb: "Service designer who has shipped tools inside three London boroughs. Currently building something she will not name yet.",
    tags: ["design", "civic", "tools"]
  },
  { id: "p_lena", category: "person",
    name: "Lena Okafor", inst: "Operator · Late-stage",
    borough: "Greenwich", latlng: [51.4690, 0.0080],
    blurb: "Former COO at two London unicorns. Now advises five funds and refuses to take a board seat.",
    tags: ["operator", "advisor", "unicorn"]
  }
];

// ── Events ──
const FLOOR_EVENTS = [
  {
    id: "evt_tonight",
    title: "The Floor — Opening Night",
    host: "The Floor",
    venue: "Phoenix Court, Camden",
    locationId: "phoenix_court",
    latlng: [51.5346, -0.1257],
    date: "2026-05-08T18:00:00",
    endDate: "2026-05-08T22:00:00",
    isLive: true,
    access: "members",
    relationship: "hosted",
    description: "The inaugural gathering. Founders, investors, operators and researchers — mapped live across King's Cross. Drinks from 18:00, demos from 19:30.",
    attendees: ["m_daria", "m_marcus", "m_lena", "m_aisha", "m_ravi", "m_elena", "m_james", "m_sofia", "m_kwame", "m_yuki", "m_priya", "m_oliver"],
    room: {
      name: "The Drawing Room",
      code: "FLOOR-2026",
      qr: true,
      instructions: "Second floor, through the library. Show code at door.",
      opens: "2026-05-08T20:30:00",
      capacity: 40
    }
  },
  {
    id: "evt_climate",
    title: "Climate Capital — Deal Room",
    host: "Chelsea Capital × Battersea Battery",
    venue: "Battersea Power Station",
    locationId: "battersea_battery",
    latlng: [51.4795, -0.1632],
    date: "2026-05-12T14:00:00",
    endDate: "2026-05-12T18:00:00",
    isLive: false,
    access: "members",
    relationship: "partnered",
    description: "Closed-door session for climate-tech founders meeting growth-stage capital. Chelsea Capital and Battersea Battery co-host.",
    attendees: ["m_daria", "m_elena", "m_james", "m_sofia"],
    room: {
      name: "The Turbine Suite",
      code: "CLMT-0512",
      qr: true,
      instructions: "Enter via the riverside entrance. Member badge required.",
      opens: "2026-05-12T17:00:00",
      capacity: 25
    }
  },
  {
    id: "evt_ai_hack",
    title: "Hackney AI Hack Night",
    host: "East London Founders",
    venue: "Mare Street Studios, Hackney",
    locationId: "east_london_founders",
    latlng: [51.5260, -0.0775],
    date: "2026-05-15T18:30:00",
    endDate: "2026-05-15T22:00:00",
    isLive: false,
    access: "public",
    relationship: "sponsored",
    description: "Monthly AI hack night. Bring a laptop, a problem, and an appetite. The Floor sponsors drinks and the after-party.",
    attendees: ["m_marcus", "m_kwame", "m_yuki", "m_priya", "m_oliver", "m_ravi"],
    room: null
  },
  {
    id: "evt_drop",
    title: "??? — Location TBC",
    host: "The Floor",
    venue: "Somewhere in King's Cross",
    locationId: null,
    latlng: [51.533, -0.126],
    date: "2026-05-22T19:00:00",
    endDate: "2026-05-22T23:00:00",
    isLive: false,
    isDrop: true,
    access: "members",
    relationship: "hosted",
    description: "Next Floor event dropping soon. Location revealed 48 hours before.",
    attendees: [],
    room: null
  }
];

// ── Members ──
const MEMBERS = [
  { id: "m_daria",  name: "Daria Petrov",  role: "Founder",  org: "Climate ML",       avatar: "DP" },
  { id: "m_marcus", name: "Marcus Chen",   role: "Engineer", org: "Independent",       avatar: "MC" },
  { id: "m_lena",   name: "Lena Okafor",   role: "Operator", org: "Advisory",          avatar: "LO" },
  { id: "m_aisha",  name: "Aisha Khan",    role: "Designer", org: "Civic Tools",       avatar: "AK" },
  { id: "m_ravi",   name: "Ravi Sharma",   role: "Founder",  org: "Canary Compute",    avatar: "RS" },
  { id: "m_elena",  name: "Elena Volkov",  role: "Investor", org: "Chelsea Capital",   avatar: "EV" },
  { id: "m_james",  name: "James Wright",  role: "Founder",  org: "Battersea Battery", avatar: "JW" },
  { id: "m_sofia",  name: "Sofia Reyes",   role: "Operator", org: "Soho Synth",        avatar: "SR" },
  { id: "m_kwame",  name: "Kwame Asante",  role: "Engineer", org: "Deptford DSP",      avatar: "KA" },
  { id: "m_yuki",   name: "Yuki Tanaka",   role: "Researcher", org: "Whitechapel AI",  avatar: "YT" },
  { id: "m_priya",  name: "Priya Patel",   role: "Founder",  org: "City Ledger",       avatar: "PP" },
  { id: "m_oliver", name: "Oliver Berg",   role: "Investor", org: "Islington Index",   avatar: "OB" }
];
