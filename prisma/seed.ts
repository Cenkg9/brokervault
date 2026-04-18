import { PrismaClient, Role, ListingStatus, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding BrokerVault...");

  await prisma.platformSettings.upsert({
    where: { key: "publish_delay_hours" },
    update: {},
    create: { key: "publish_delay_hours", value: "12" },
  });
  await prisma.platformSettings.upsert({
    where: { key: "app_name" },
    update: {},
    create: { key: "app_name", value: "BrokerVault" },
  });

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@brokervault.com" },
    update: {},
    create: { name: "Platform Owner", email: "owner@brokervault.com", passwordHash: hash("owner123"), role: Role.OWNER },
  });

  const vip = await prisma.user.upsert({
    where: { email: "sofia@brokervault.com" },
    update: {},
    create: { name: "Sofia Reyes", email: "sofia@brokervault.com", passwordHash: hash("vip123"), role: Role.VIP },
  });

  const james = await prisma.user.upsert({
    where: { email: "james@brokervault.com" },
    update: {},
    create: { name: "James Harrington", email: "james@brokervault.com", passwordHash: hash("member123"), role: Role.MEMBER },
  });

  const clara = await prisma.user.upsert({
    where: { email: "clara@brokervault.com" },
    update: {},
    create: { name: "Clara Fontaine", email: "clara@brokervault.com", passwordHash: hash("member123"), role: Role.MEMBER },
  });

  const now = new Date();
  const past = (h: number) => new Date(now.getTime() - h * 3_600_000);
  const future = (h: number) => new Date(now.getTime() + h * 3_600_000);

  const listings = [
    // ── ACTIVE ──
    {
      title: "Penthouse Suite — Bosphorus View",
      description: "Stunning 450m² penthouse with panoramic Bosphorus views. 4 bedrooms, 3 bathrooms, private terrace with infinity pool. Premium finishes throughout. Located in the heart of Beşiktaş.",
      category: Category.REAL_ESTATE, price: 4_500_000, location: "Beşiktaş, Istanbul",
      photos: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"],
      status: ListingStatus.ACTIVE, submittedById: james.id, publishAt: past(15), publishedAt: past(15),
    },
    {
      title: "Villa Bellagio — Lake Como",
      description: "Iconic 800m² lakefront villa with private dock. 6 bedrooms, original frescoes, wine cellar. Full staff included. Unique investment opportunity.",
      category: Category.REAL_ESTATE, price: 12_000_000, location: "Lake Como, Italy",
      photos: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"],
      status: ListingStatus.ACTIVE, submittedById: vip.id, publishAt: past(48), publishedAt: past(48),
    },
    {
      title: "2024 Ferrari SF90 Stradale",
      description: "986HP hybrid hypercar. 1,800km only. Rosso Corsa with Nero interior. Full carbon package. All service docs, first owner.",
      category: Category.LUXURY_CARS, price: 750_000, location: "Monaco",
      photos: ["https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800"],
      status: ListingStatus.ACTIVE, submittedById: clara.id, publishAt: past(30), publishedAt: past(30),
    },
    {
      title: "Sunseeker Predator 74",
      description: "75ft luxury motor yacht. Sleeps 8. Twin MAN diesel engines. Stabilizers, full AV system, watermaker. Perfect Mediterranean season ready.",
      category: Category.YACHTS, price: 2_200_000, location: "Marbella, Spain",
      photos: ["https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800"],
      status: ListingStatus.ACTIVE, submittedById: james.id, publishAt: past(72), publishedAt: past(72),
    },
    {
      title: "Sky Residences Penthouse — Dubai Marina",
      description: "400m² ultra-luxury penthouse. Full floor. 5 beds, private pool, 360° views. Handed over 2023. Direct developer.",
      category: Category.REAL_ESTATE, price: 8_900_000, location: "Dubai Marina, UAE",
      photos: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
      status: ListingStatus.ACTIVE, submittedById: vip.id, publishAt: past(20), publishedAt: past(20),
    },
    {
      title: "Rolls-Royce Ghost Series II",
      description: "2023. Bespoke Lyric commission. 3,200km. Starlight headliner, privacy blinds, champagne fridge.",
      category: Category.LUXURY_CARS, price: 420_000, location: "London, UK",
      photos: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"],
      status: ListingStatus.ACTIVE, submittedById: clara.id, publishAt: past(5), publishedAt: past(5),
    },
    {
      title: "Benetti Classic 120 Motor Yacht",
      description: "36m custom Benetti. 5 cabins. Stabilizers, zero-speed. Full refit 2022. Ideal for private use or charter.",
      category: Category.YACHTS, price: 5_800_000, location: "Palma de Mallorca",
      photos: ["https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800"],
      status: ListingStatus.ACTIVE, submittedById: james.id, publishAt: past(18), publishedAt: past(18),
    },
    {
      title: "Historic Palazzo — Venice Grand Canal",
      description: "16th-century palazzo on the Grand Canal. 1,200m², 8 bedrooms. Frescoed ceilings, private water entrance. Rare opportunity.",
      category: Category.REAL_ESTATE, price: 22_000_000, location: "Venice, Italy",
      photos: ["https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800"],
      status: ListingStatus.ACTIVE, submittedById: vip.id, publishAt: past(60), publishedAt: past(60),
    },
    {
      title: "Lamborghini Urus Performante",
      description: "2024. 666HP. Giallo Belenus. Carbon exterior package. 800km. Fully optioned. Collection condition.",
      category: Category.LUXURY_CARS, price: 310_000, location: "Geneva, Switzerland",
      photos: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"],
      status: ListingStatus.ACTIVE, submittedById: clara.id, publishAt: past(8), publishedAt: past(8),
    },
    {
      title: "Oceanfront Estate — Costa Smeralda",
      description: "Sardinia's finest. 6-bed villa, private beach, 2,500m² plot. Contemporary design, fully staffed. Turnkey.",
      category: Category.REAL_ESTATE, price: 16_500_000, location: "Costa Smeralda, Sardinia",
      photos: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"],
      status: ListingStatus.ACTIVE, submittedById: james.id, publishAt: past(36), publishedAt: past(36),
    },
    // ── PENDING (VIP + OWNER only) ──
    {
      title: "Mayfair Townhouse — Discreet Sale",
      description: "Grade II listed Mayfair townhouse. 5 bedrooms, private garage, garden. Fully renovated 2024.",
      category: Category.REAL_ESTATE, price: 18_000_000, location: "Mayfair, London",
      photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"],
      status: ListingStatus.PENDING, submittedById: clara.id, publishAt: future(8),
    },
    {
      title: "Bugatti Chiron Super Sport",
      description: "2022. 1,600HP. Nocturne Black. 200km. Carbon fibre body. Full factory warranty remaining.",
      category: Category.LUXURY_CARS, price: 3_800_000, location: "Monaco",
      photos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800"],
      status: ListingStatus.PENDING, submittedById: vip.id, publishAt: future(3),
    },
    {
      title: "Feadship Custom 55m Superyacht",
      description: "2021 Feadship. 5 cabins, beach club, pool. Range 4,000nm. Under 500 engine hours.",
      category: Category.YACHTS, price: 28_000_000, location: "Fort Lauderdale, FL",
      photos: ["https://images.unsplash.com/photo-1575492636781-bddba7f08462?w=800"],
      status: ListingStatus.PENDING, submittedById: james.id, publishAt: future(5),
    },
    {
      title: "Penthouse at One Monte-Carlo",
      description: "Brand new 300m² penthouse. 3 bedrooms, solarium, sea views. Developer direct.",
      category: Category.REAL_ESTATE, price: 35_000_000, location: "Monte-Carlo, Monaco",
      photos: ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"],
      status: ListingStatus.PENDING, submittedById: clara.id, publishAt: future(11),
    },
    {
      title: "McLaren P1 — Collector's Edition",
      description: "1 of 375. Original UK car. 916HP hybrid. 1,100km. Papaya Spark. Full MSO provenance pack.",
      category: Category.LUXURY_CARS, price: 1_650_000, location: "Zurich, Switzerland",
      photos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      status: ListingStatus.PENDING, submittedById: vip.id, publishAt: future(2),
    },
  ];

  const createdListings: { id: string }[] = [];
  for (const data of listings) {
    const existing = await prisma.listing.findFirst({ where: { title: data.title } });
    if (existing) { createdListings.push(existing); continue; }
    const l = await prisma.listing.create({ data });
    createdListings.push(l);
  }

  console.log(`Created ${createdListings.length} listings`);

  // Seed a sample conversation
  const [aId, bId] = [clara.id, james.id].sort();
  const existingConv = await prisma.conversation.findUnique({
    where: { listingId_participantAId_participantBId: { listingId: createdListings[0].id, participantAId: aId, participantBId: bId } },
  });

  if (!existingConv) {
    await prisma.conversation.create({
      data: {
        listingId: createdListings[0].id,
        participantAId: aId,
        participantBId: bId,
        lastMessageAt: new Date(),
        messages: {
          create: [
            { body: "Hello James, I'm very interested in the Bosphorus penthouse. Is it still available?", senderId: clara.id, sentAt: new Date(Date.now() - 7_200_000) },
            { body: "Yes, absolutely still available. Would you like to arrange a viewing this week?", senderId: james.id, sentAt: new Date(Date.now() - 5_400_000) },
            { body: "That would be perfect. I'm free Thursday or Friday afternoon.", senderId: clara.id, sentAt: new Date(Date.now() - 3_600_000) },
          ],
        },
      },
    });
  }

  console.log("\nSeed complete. Login credentials:");
  console.log("  Owner:   owner@brokervault.com / owner123  (role: OWNER)");
  console.log("  VIP:     sofia@brokervault.com / vip123    (role: VIP)");
  console.log("  Member:  james@brokervault.com / member123 (role: MEMBER)");
  console.log("  Member:  clara@brokervault.com / member123 (role: MEMBER)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
