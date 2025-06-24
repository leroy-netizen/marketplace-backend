import { AppDataSource } from "../config/db.config";
import { Category } from "../entities/Category.entity";

const initialCategories = [
  {
    name: "Electronics",
    description:
      "Smartphones, laptops, tablets, gaming consoles, and cutting-edge tech gadgets",
    icon: "smartphone",
    sortOrder: 1,
  },
  {
    name: "Fashion & Apparel",
    description:
      "Clothing, shoes, accessories, jewelry, and style essentials for all occasions",
    icon: "shirt",
    sortOrder: 2,
  },
  {
    name: "Home & Furniture",
    description:
      "Furniture, home decor, kitchen appliances, and everything for your living space",
    icon: "home",
    sortOrder: 3,
  },
  {
    name: "Automotive Parts",
    description:
      "Car parts, motorcycle accessories, tools, and automotive maintenance supplies",
    icon: "car",
    sortOrder: 4,
  },
  {
    name: "Food & Beverages",
    description:
      "Gourmet foods, beverages, snacks, and culinary ingredients from around the world",
    icon: "utensils",
    sortOrder: 5,
  },
  {
    name: "Health & Beauty",
    description:
      "Skincare, cosmetics, wellness products, and personal care essentials",
    icon: "heart",
    sortOrder: 6,
  },
  {
    name: "Sports & Fitness",
    description:
      "Exercise equipment, sportswear, outdoor gear, and fitness accessories",
    icon: "dumbbell",
    sortOrder: 7,
  },
  {
    name: "Books & Media",
    description:
      "Books, e-books, audiobooks, magazines, and educational materials",
    icon: "book",
    sortOrder: 8,
  },
  {
    name: "Toys & Games",
    description:
      "Toys, board games, video games, and entertainment for all ages",
    icon: "gamepad-2",
    sortOrder: 9,
  },
  {
    name: "Art & Crafts",
    description:
      "Art supplies, handmade crafts, creative materials, and artistic creations",
    icon: "palette",
    sortOrder: 10,
  },
  {
    name: "Garden & Outdoor",
    description:
      "Gardening tools, plants, outdoor furniture, and landscaping supplies",
    icon: "flower",
    sortOrder: 11,
  },
  {
    name: "Baby & Kids",
    description:
      "Baby products, children's clothing, educational toys, and parenting essentials",
    icon: "baby",
    sortOrder: 12,
  },
  {
    name: "Pet Supplies",
    description:
      "Pet food, toys, accessories, and care products for all types of pets",
    icon: "heart-handshake",
    sortOrder: 13,
  },
  {
    name: "Office & Business",
    description:
      "Office supplies, business equipment, stationery, and professional tools",
    icon: "briefcase",
    sortOrder: 14,
  },
  {
    name: "Musical Instruments",
    description:
      "Guitars, keyboards, drums, audio equipment, and music accessories",
    icon: "music",
    sortOrder: 15,
  },
  {
    name: "Collectibles & Antiques",
    description:
      "Vintage items, collectibles, antiques, and unique historical pieces",
    icon: "gem",
    sortOrder: 16,
  },
];

export const seedCategories = async () => {
  try {
    const categoryRepo = AppDataSource.getRepository(Category);

    console.log("🌱 Seeding categories...");

    for (const categoryData of initialCategories) {
      // Check if category already exists
      const existingCategory = await categoryRepo.findOne({
        where: { name: categoryData.name },
      });

      if (!existingCategory) {
        const category = categoryRepo.create(categoryData);
        await categoryRepo.save(category);
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`⏭️  Category already exists: ${categoryData.name}`);
      }
    }

    console.log("🎉 Category seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      await seedCategories();
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
}
