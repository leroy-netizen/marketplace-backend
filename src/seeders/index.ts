import { AppDataSource } from "../config/db.config";
import { seedCategories } from "./category.seeder";

/**
 * Main seeder function that runs all seeders
 */
export const runAllSeeders = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    console.log("=" .repeat(50));

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection established");
    }

    // Run category seeder
    await seedCategories();

    console.log("=" .repeat(50));
    console.log("🎉 All seeders completed successfully!");
    
  } catch (error) {
    console.error("❌ Error running seeders:", error);
    throw error;
  }
};

/**
 * Run seeders if this file is executed directly
 */
if (require.main === module) {
  runAllSeeders()
    .then(async () => {
      console.log("🏁 Seeding process finished");
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("💥 Seeding process failed:", error);
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      process.exit(1);
    });
}
