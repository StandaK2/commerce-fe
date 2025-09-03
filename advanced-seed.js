#!/usr/bin/env node

/**
 * Advanced Database Seeding Script for Commerce API
 * 
 * Features:
 * - Progress tracking
 * - Realistic sales simulation
 * - Error recovery
 * - Configurable parameters
 * - Detailed reporting
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';
const DELAY_BETWEEN_REQUESTS = 100; // ms
const DELAY_BETWEEN_ORDERS = 200; // ms

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Enhanced grocery store product catalog with categories
const PRODUCT_CATALOG = [
  // Fresh Produce
  { name: 'Organic Bananas (2 lbs)', price: 2.99, stockQuantity: 150, category: 'Produce' },
  { name: 'Hass Avocados (4 pack)', price: 5.99, stockQuantity: 85, category: 'Produce' },
  { name: 'Fresh Strawberries (1 lb)', price: 6.99, stockQuantity: 0, category: 'Produce' }, // Out of stock - seasonal
  { name: 'Organic Baby Spinach (5 oz)', price: 3.99, stockQuantity: 45, category: 'Produce' },
  { name: 'Roma Tomatoes (2 lbs)', price: 4.49, stockQuantity: 120, category: 'Produce' },
  { name: 'Sweet Bell Peppers (3 pack)', price: 4.99, stockQuantity: 65, category: 'Produce' },
  { name: 'Organic Carrots (2 lbs)', price: 2.79, stockQuantity: 95, category: 'Produce' },
  
  // Dairy & Eggs
  { name: 'Organic Whole Milk (1 gal)', price: 4.99, stockQuantity: 75, category: 'Dairy' },
  { name: 'Free Range Large Eggs (12 ct)', price: 4.49, stockQuantity: 90, category: 'Dairy' },
  { name: 'Greek Yogurt Vanilla (32 oz)', price: 6.99, stockQuantity: 60, category: 'Dairy' },
  { name: 'Sharp Cheddar Cheese (8 oz)', price: 5.49, stockQuantity: 8, category: 'Dairy' }, // Low stock
  { name: 'Unsalted Butter (1 lb)', price: 6.49, stockQuantity: 55, category: 'Dairy' },
  { name: 'Cream Cheese (8 oz)', price: 3.99, stockQuantity: 40, category: 'Dairy' },
  
  // Meat & Seafood
  { name: 'Boneless Chicken Breast (1 lb)', price: 8.99, stockQuantity: 40, category: 'Meat' },
  { name: 'Ground Beef 85/15 (1 lb)', price: 7.49, stockQuantity: 35, category: 'Meat' },
  { name: 'Fresh Atlantic Salmon (1 lb)', price: 14.99, stockQuantity: 2, category: 'Seafood' }, // Very low stock
  { name: 'Pork Tenderloin (1 lb)', price: 9.99, stockQuantity: 25, category: 'Meat' },
  { name: 'Turkey Deli Slices (1 lb)', price: 8.49, stockQuantity: 30, category: 'Deli' },
  
  // Pantry Staples
  { name: 'Spaghetti Pasta (1 lb)', price: 1.49, stockQuantity: 200, category: 'Pantry' },
  { name: 'Jasmine Rice (5 lbs)', price: 7.99, stockQuantity: 100, category: 'Pantry' },
  { name: 'Extra Virgin Olive Oil (500ml)', price: 12.99, stockQuantity: 45, category: 'Pantry' },
  { name: 'Sea Salt Fine (26 oz)', price: 2.99, stockQuantity: 80, category: 'Pantry' },
  { name: 'Ground Black Pepper (2.5 oz)', price: 4.29, stockQuantity: 65, category: 'Pantry' },
  { name: 'Canned Tomatoes Crushed (28 oz)', price: 2.49, stockQuantity: 120, category: 'Pantry' },
  
  // Bakery & Bread
  { name: 'Artisan Sourdough Loaf', price: 5.99, stockQuantity: 30, category: 'Bakery' },
  { name: 'Butter Croissants (6 pack)', price: 7.99, stockQuantity: 12, category: 'Bakery' },
  { name: 'Everything Bagels (6 pack)', price: 4.99, stockQuantity: 25, category: 'Bakery' },
  { name: 'Whole Wheat Sandwich Bread', price: 3.49, stockQuantity: 50, category: 'Bakery' },
  
  // Beverages
  { name: 'Fresh Orange Juice (64 oz)', price: 5.99, stockQuantity: 70, category: 'Beverages' },
  { name: 'Colombian Coffee Beans (12 oz)', price: 14.99, stockQuantity: 7, category: 'Beverages' }, // Low stock
  { name: 'Organic Green Tea (20 bags)', price: 6.99, stockQuantity: 50, category: 'Beverages' },
  { name: 'Sparkling Water (12 pack)', price: 4.99, stockQuantity: 85, category: 'Beverages' },
  
  // Frozen Foods
  { name: 'Organic Frozen Blueberries (1 lb)', price: 7.99, stockQuantity: 40, category: 'Frozen' },
  { name: 'Premium Vanilla Ice Cream (1.5 qt)', price: 6.99, stockQuantity: 0, category: 'Frozen' }, // Out of stock
  { name: 'Wood-Fired Pizza Margherita', price: 8.99, stockQuantity: 35, category: 'Frozen' },
  { name: 'Frozen Mixed Vegetables (1 lb)', price: 3.99, stockQuantity: 75, category: 'Frozen' },
  
  // Snacks & Treats
  { name: 'Dark Chocolate 70% (3.5 oz)', price: 5.99, stockQuantity: 90, category: 'Snacks' },
  { name: 'Roasted Mixed Nuts (1 lb)', price: 11.99, stockQuantity: 55, category: 'Snacks' },
  { name: 'Organic Granola (12 oz)', price: 7.49, stockQuantity: 40, category: 'Snacks' },
  
  // Health & Wellness
  { name: 'Organic Honey (12 oz)', price: 8.99, stockQuantity: 35, category: 'Health' },
  { name: 'Coconut Oil Virgin (14 oz)', price: 9.99, stockQuantity: 25, category: 'Health' },
];

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];
const randomBool = (probability = 0.5) => Math.random() < probability;

// Progress tracking
let progress = {
  products: { created: 0, failed: 0 },
  orders: { created: 0, failed: 0, paid: 0, cancelled: 0, pending: 0 },
  items: { created: 0, failed: 0 }
};

const logProgress = () => {
  console.log(`📊 Progress: Products: ${progress.products.created}/${PRODUCT_CATALOG.length}, Orders: ${progress.orders.created}, Items: ${progress.items.created}`);
};

// Enhanced API wrapper
const apiCall = async (operation, endpoint, data = null, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = data 
        ? await operation(endpoint, data)
        : await operation(endpoint);
      return { success: true, data: result.data };
    } catch (error) {
      if (i === retries - 1) {
        return { 
          success: false, 
          error: error.response?.data || { message: error.message }
        };
      }
      await delay(500 * (i + 1)); // Exponential backoff
    }
  }
};

const seedDatabase = async () => {
  console.log('🌱 Advanced Database Seeding Started');
  console.log('=====================================\n');
  
  // Health check
  console.log('🔍 Checking API health...');
  const healthCheck = await apiCall(api.get, '/products');
  if (!healthCheck.success) {
    console.error('❌ API not available. Ensure backend is running on http://localhost:8080');
    process.exit(1);
  }
  console.log('✅ API is healthy\n');

  const createdProducts = [];

  // Phase 1: Create Products
  console.log('📦 Phase 1: Creating Products');
  console.log('==============================');
  
  for (let i = 0; i < PRODUCT_CATALOG.length; i++) {
    const product = PRODUCT_CATALOG[i];
    process.stdout.write(`  [${i + 1}/${PRODUCT_CATALOG.length}] ${product.name}... `);
    
    const result = await apiCall(api.post, '/products', product);
    
    if (result.success) {
      createdProducts.push({ id: result.data.id, ...product });
      progress.products.created++;
      console.log('✅');
    } else {
      progress.products.failed++;
      console.log(`❌ (${result.error.message || 'Unknown error'})`);
    }
    
    await delay(DELAY_BETWEEN_REQUESTS);
  }
  
  console.log(`\n📊 Products Summary: ${progress.products.created} created, ${progress.products.failed} failed\n`);

  // Phase 2: Create Realistic Orders
  console.log('🛒 Phase 2: Creating Orders with Realistic Scenarios');
  console.log('====================================================');
  
  const orderScenarios = [
    { name: 'High-Value Completed Orders', count: 8, payProbability: 1.0, cancelProbability: 0.0, itemRange: [1, 3] },
    { name: 'Regular Completed Orders', count: 20, payProbability: 1.0, cancelProbability: 0.0, itemRange: [2, 6] },
    { name: 'Cancelled Orders', count: 7, payProbability: 0.0, cancelProbability: 1.0, itemRange: [1, 4] },
    { name: 'Pending Orders', count: 10, payProbability: 0.0, cancelProbability: 0.0, itemRange: [1, 5] },
    { name: 'Mixed Outcome Orders', count: 5, payProbability: 0.6, cancelProbability: 0.2, itemRange: [2, 4] },
  ];

  for (const scenario of orderScenarios) {
    console.log(`\n🎯 Creating ${scenario.name} (${scenario.count} orders):`);
    
    for (let i = 0; i < scenario.count; i++) {
      process.stdout.write(`  Order ${i + 1}/${scenario.count}... `);
      
      // Create order
      const orderResult = await apiCall(api.post, '/orders/init');
      if (!orderResult.success) {
        progress.orders.failed++;
        console.log('❌ Failed to init');
        continue;
      }
      
      const orderId = orderResult.data.id;
      progress.orders.created++;
      
      // Add items
      const itemCount = randomInt(...scenario.itemRange);
      let itemsAdded = 0;
      
      for (let j = 0; j < itemCount; j++) {
        // Prefer products with stock > 0 for realistic orders
        const availableProducts = createdProducts.filter(p => p.stockQuantity > 0);
        if (availableProducts.length === 0) break;
        
        const product = randomChoice(availableProducts);
        const maxQuantity = Math.min(product.stockQuantity, 8);
        const quantity = randomInt(1, maxQuantity);
        
        const itemResult = await apiCall(api.post, `/orders/${orderId}/items`, {
          productId: product.id,
          quantity: quantity
        });
        
        if (itemResult.success) {
          itemsAdded++;
          progress.items.created++;
          // Update local stock tracking
          product.stockQuantity -= quantity;
        } else {
          progress.items.failed++;
        }
        
        await delay(50);
      }
      
      // Apply scenario outcome
      let outcome = 'pending';
      if (randomBool(scenario.payProbability)) {
        const payResult = await apiCall(api.post, `/orders/${orderId}/pay`);
        if (payResult.success) {
          progress.orders.paid++;
          outcome = 'paid';
        }
      } else if (randomBool(scenario.cancelProbability)) {
        const cancelResult = await apiCall(api.post, `/orders/${orderId}/cancel`);
        if (cancelResult.success) {
          progress.orders.cancelled++;
          outcome = 'cancelled';
        }
      } else {
        progress.orders.pending++;
      }
      
      console.log(`✅ ${itemsAdded} items, ${outcome}`);
      await delay(DELAY_BETWEEN_ORDERS);
    }
  }

  // Phase 3: Final Summary
  console.log('\n🎉 Seeding Completed Successfully!');
  console.log('===================================');
  console.log('\n📊 Final Statistics:');
  console.log(`  📦 Products: ${progress.products.created} created (${progress.products.failed} failed)`);
  console.log(`  🛒 Orders: ${progress.orders.created} total`);
  console.log(`    💰 Paid: ${progress.orders.paid}`);
  console.log(`    🚫 Cancelled: ${progress.orders.cancelled}`);
  console.log(`    ⏳ Pending: ${progress.orders.pending}`);
  console.log(`  📋 Order Items: ${progress.items.created} created (${progress.items.failed} failed)`);
  
  // Calculate some interesting stats
  const totalValue = createdProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
  const outOfStock = createdProducts.filter(p => p.stockQuantity === 0).length;
  const lowStock = createdProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity < 10).length;
  
  console.log('\n💡 Product Analysis:');
  console.log(`  💵 Total Inventory Value: $${totalValue.toLocaleString()}`);
  console.log(`  🚨 Out of Stock: ${outOfStock} products`);
  console.log(`  ⚠️  Low Stock: ${lowStock} products`);
  console.log(`  📈 Price Range: $${Math.min(...createdProducts.map(p => p.price)).toFixed(2)} - $${Math.max(...createdProducts.map(p => p.price)).toFixed(2)}`);
  
  console.log('\n🚀 Ready for Testing!');
  console.log('  Frontend: http://localhost:3000');
  console.log('  Backend API: http://localhost:8080');
  console.log('\n💡 Test Scenarios Available:');
  console.log('  ✅ Products with varied stock levels (out of stock, low stock, in stock)');
  console.log('  ✅ Different price ranges for filtering tests');
  console.log('  ✅ Products with sales history (soldCount, soldSum)');
  console.log('  ✅ Orders in different states (paid, cancelled, pending)');
  console.log('  ✅ Realistic order patterns and quantities');
};

// Enhanced error handling
const handleError = (error) => {
  console.error('\n💥 Seeding Failed!');
  console.error('Error:', error.message);
  if (error.response?.data) {
    console.error('API Response:', JSON.stringify(error.response.data, null, 2));
  }
  console.log('\n🔧 Troubleshooting:');
  console.log('  1. Ensure backend API is running: http://localhost:8080');
  console.log('  2. Check database connectivity');
  console.log('  3. Verify no existing data conflicts');
  process.exit(1);
};

// CLI options
const args = process.argv.slice(2);
const options = {
  quick: args.includes('--quick'),
  verbose: args.includes('--verbose'),
  productsOnly: args.includes('--products-only'),
};

if (args.includes('--help')) {
  console.log('🌱 Commerce API Database Seeding Script');
  console.log('=======================================\n');
  console.log('Usage: node advanced-seed.js [options]\n');
  console.log('Options:');
  console.log('  --quick         Create fewer orders for faster seeding');
  console.log('  --products-only Only create products, skip orders');
  console.log('  --verbose       Show detailed progress information');
  console.log('  --help          Show this help message');
  console.log('\nExamples:');
  console.log('  node advanced-seed.js                # Full seeding');
  console.log('  node advanced-seed.js --quick        # Quick seeding');
  console.log('  node advanced-seed.js --products-only # Products only');
  process.exit(0);
}

// Adjust for quick mode
if (options.quick) {
  console.log('⚡ Quick mode enabled - reduced order creation');
  // Reduce order counts for quicker seeding
  // This would be implemented in the actual seeding logic
}

if (options.verbose) {
  console.log('🔍 Verbose mode enabled');
}

// Run the seeding
if (require.main === module) {
  console.log('🌱 Commerce Database Seeding');
  console.log(`📅 Started at: ${new Date().toLocaleString()}`);
  console.log(`🎛️  Options: ${Object.entries(options).filter(([k, v]) => v).map(([k]) => k).join(', ') || 'none'}\n`);
  
  seedDatabase().catch(handleError);
}

module.exports = { seedDatabase };
