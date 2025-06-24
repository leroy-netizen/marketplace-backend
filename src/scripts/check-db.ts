import { AppDataSource } from "../config/db.config";
import { Category } from "../entities/Category.entity";
import { User } from "../entities/User.entity";
import { Product } from "../entities/Product.entity";

/**
 * Check database status and show current data counts
 */
export const checkDatabaseStatus = async () => {
  try {
    console.log("🔍 Checking database status...");
    console.log("=" .repeat(50));

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection established");
    }

    // Get repositories
    const categoryRepo = AppDataSource.getRepository(Category);
    const userRepo = AppDataSource.getRepository(User);
    const productRepo = AppDataSource.getRepository(Product);

    // Count records
    const categoryCount = await categoryRepo.count();
    const userCount = await userRepo.count();
    const productCount = await productRepo.count();

    console.log("\n📊 Current Database Status:");
    console.log(`📁 Categories: ${categoryCount}`);
    console.log(`👥 Users: ${userCount}`);
    console.log(`📦 Products: ${productCount}`);

    // Show categories if any exist
    if (categoryCount > 0) {
      console.log("\n📋 Existing Categories:");
      const categories = await categoryRepo.find({
        order: { sortOrder: "ASC" }
      });
      
      categories.forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.name} (${category.icon})`);
      });
    } else {
      console.log("\n⚠️  No categories found - database needs seeding!");
    }

    console.log("=" .repeat(50));
    
  } catch (error) {
    console.error("❌ Error checking database:", error);
    throw error;
  }
};

/**
 * Run database check if this file is executed directly
 */
if (require.main === module) {
  checkDatabaseStatus()
    .then(async () => {
      console.log("🏁 Database check completed");
      await AppDataSource.destroy();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("💥 Database check failed:", error);
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
      process.exit(1);
    });
}
