#!/usr/bin/env node

/**
 * Database Seeding Script for Commerce API
 * 
 * This script populates the database with realistic test data using the backend API.
 * It creates products, orders, and order items with varied states and properties.
 * 
 * Usage:
 *   node seed-database.js
 * 
 * Prerequisites:
 *   - Backend API running on http://localhost:8080
 *   - Node.js installed
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

// Configure axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Grocery store products with realistic variations
const SAMPLE_PRODUCTS = [
  // Fresh Produce
  { name: 'Organic Bananas (1 lb)', price: 1.99, stockQuantity: 150 },
  { name: 'Avocados (3 pack)', price: 4.99, stockQuantity: 85 },
  { name: 'Fresh Strawberries (1 lb)', price: 5.99, stockQuantity: 0 }, // Out of stock - seasonal
  { name: 'Organic Spinach (5 oz)', price: 3.49, stockQuantity: 45 },
  { name: 'Roma Tomatoes (1 lb)', price: 2.79, stockQuantity: 120 },
  
  // Dairy & Eggs
  { name: 'Organic Whole Milk (1 gal)', price: 4.49, stockQuantity: 75 },
  { name: 'Free Range Eggs (12 ct)', price: 3.99, stockQuantity: 90 },
  { name: 'Greek Yogurt Plain (32 oz)', price: 5.99, stockQuantity: 60 },
  { name: 'Sharp Cheddar Cheese (8 oz)', price: 4.79, stockQuantity: 8 }, // Low stock
  { name: 'Butter Unsalted (1 lb)', price: 5.49, stockQuantity: 55 },
  
  // Meat & Seafood
  { name: 'Chicken Breast (1 lb)', price: 7.99, stockQuantity: 40 },
  { name: 'Ground Beef 85/15 (1 lb)', price: 6.49, stockQuantity: 35 },
  { name: 'Atlantic Salmon (1 lb)', price: 12.99, stockQuantity: 2 }, // Very low stock
  { name: 'Pork Tenderloin (1 lb)', price: 8.99, stockQuantity: 25 },
  
  // Pantry Staples
  { name: 'Pasta Spaghetti (1 lb)', price: 1.29, stockQuantity: 200 },
  { name: 'Rice Jasmine (2 lb)', price: 3.99, stockQuantity: 100 },
  { name: 'Olive Oil Extra Virgin (500ml)', price: 8.99, stockQuantity: 45 },
  { name: 'Sea Salt (26 oz)', price: 2.49, stockQuantity: 80 },
  { name: 'Black Pepper Ground (2 oz)', price: 3.29, stockQuantity: 65 },
  
  // Bakery
  { name: 'Sourdough Bread Loaf', price: 4.99, stockQuantity: 30 },
  { name: 'Croissants (6 pack)', price: 6.99, stockQuantity: 12 },
  { name: 'Bagels Everything (6 pack)', price: 4.49, stockQuantity: 25 },
  
  // Beverages
  { name: 'Orange Juice (64 oz)', price: 4.99, stockQuantity: 70 },
  { name: 'Coffee Beans Colombian (12 oz)', price: 12.99, stockQuantity: 7 }, // Low stock
  { name: 'Green Tea Bags (20 ct)', price: 5.99, stockQuantity: 50 },
  
  // Frozen Foods
  { name: 'Frozen Blueberries (1 lb)', price: 6.99, stockQuantity: 40 },
  { name: 'Ice Cream Vanilla (1.5 qt)', price: 5.99, stockQuantity: 0 }, // Out of stock
  { name: 'Frozen Pizza Margherita', price: 7.99, stockQuantity: 35 },
  
  // Snacks & Treats
  { name: 'Dark Chocolate Bar (3.5 oz)', price: 4.99, stockQuantity: 90 },
  { name: 'Mixed Nuts (1 lb)', price: 9.99, stockQuantity: 55 }
];

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomChoice = (array) => array[Math.floor(Math.random() * array.length)];

// API call wrapper with error handling
const apiCall = async (operation, ...args) => {
  try {
    const result = await operation(...args);
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`API Error:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Seeding functions
const createProduct = async (productData) => {
  return apiCall(api.post, '/products', productData);
};

const initOrder = async () => {
  return apiCall(api.post, '/orders/init');
};

const createOrderItem = async (orderId, productId, quantity) => {
  return apiCall(api.post, `/orders/${orderId}/items`, { productId, quantity });
};

const payOrder = async (orderId) => {
  return apiCall(api.post, `/orders/${orderId}/pay`);
};

const cancelOrder = async (orderId) => {
  return apiCall(api.post, `/orders/${orderId}/cancel`);
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');
  
  try {
    // Check if API is available
    console.log('🔍 Checking API availability...');
    await api.get('/products');
    console.log('✅ API is available\n');
  } catch (error) {
    console.error('❌ API is not available. Please ensure the backend is running on http://localhost:8080');
    process.exit(1);
  }

  const createdProducts = [];
  const createdOrders = [];

  // 1. Create Products
  console.log('📦 Creating products...');
  for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
    const product = SAMPLE_PRODUCTS[i];
    console.log(`  Creating: ${product.name}`);
    
    const result = await createProduct(product);
    if (result.success) {
      createdProducts.push({ id: result.data.id, ...product });
      console.log(`  ✅ Created: ${product.name} (ID: ${result.data.id})`);
    } else {
      console.log(`  ❌ Failed: ${product.name}`);
    }
    
    await delay(100); // Small delay to avoid overwhelming the API
  }
  
  console.log(`\n📦 Created ${createdProducts.length} products\n`);

  // 2. Create Orders with varied scenarios
  console.log('🛒 Creating orders with different scenarios...\n');
  
  const orderScenarios = [
    { name: 'Completed Orders', count: 15, shouldPay: true, shouldCancel: false },
    { name: 'Cancelled Orders', count: 5, shouldPay: false, shouldCancel: true },
    { name: 'Pending Orders', count: 8, shouldPay: false, shouldCancel: false },
  ];

  for (const scenario of orderScenarios) {
    console.log(`📋 Creating ${scenario.count} ${scenario.name}...`);
    
    for (let i = 0; i < scenario.count; i++) {
      // Create order
      const orderResult = await initOrder();
      if (!orderResult.success) {
        console.log(`  ❌ Failed to create order`);
        continue;
      }
      
      const orderId = orderResult.data.id;
      createdOrders.push({ id: orderId, scenario: scenario.name });
      
      // Add random order items (1-5 items per order)
      const itemCount = randomInt(1, 5);
      const orderItems = [];
      const usedProductIds = new Set(); // Track products already added to this order
      
      for (let j = 0; j < itemCount; j++) {
        // Select random product (only those with stock > 0 and not already in this order)
        const availableProducts = createdProducts.filter(p => 
          p.stockQuantity > 0 && !usedProductIds.has(p.id)
        );
        if (availableProducts.length === 0) break;
        
        const product = randomChoice(availableProducts);
        const maxQuantity = Math.min(product.stockQuantity, 10);
        const quantity = randomInt(1, maxQuantity);
        
        const itemResult = await createOrderItem(orderId, product.id, quantity);
        if (itemResult.success) {
          orderItems.push({ productId: product.id, quantity, productName: product.name });
          usedProductIds.add(product.id); // Mark product as used in this order
          // Update local stock tracking
          product.stockQuantity -= quantity;
        }
        
        await delay(50);
      }
      
      console.log(`    Order ${i + 1}: ${orderItems.length} items (${orderItems.map(item => `${item.quantity}x ${item.productName}`).join(', ')})`);
      
      // Apply scenario-specific actions
      if (scenario.shouldPay) {
        await delay(100);
        const payResult = await payOrder(orderId);
        if (payResult.success) {
          console.log(`    ✅ Order paid`);
        }
      } else if (scenario.shouldCancel) {
        await delay(100);
        const cancelResult = await cancelOrder(orderId);
        if (cancelResult.success) {
          console.log(`    🚫 Order cancelled`);
        }
      } else {
        console.log(`    ⏳ Order left pending`);
      }
      
      await delay(200); // Delay between orders
    }
    console.log(`  ✅ Created ${scenario.count} ${scenario.name}\n`);
  }

  // 3. Create some additional orders with edge cases
  console.log('🎯 Creating edge case scenarios...\n');
  
  // Large order scenario
  console.log('  Creating large order...');
  const largeOrderResult = await initOrder();
  if (largeOrderResult.success) {
    const largeOrderId = largeOrderResult.data.id;
    
    // Add many items from different products
    const highStockProducts = createdProducts.filter(p => p.stockQuantity > 20);
    for (const product of highStockProducts.slice(0, 8)) {
      const quantity = randomInt(5, 15);
      await createOrderItem(largeOrderId, product.id, quantity);
      await delay(50);
    }
    
    await payOrder(largeOrderId);
    console.log('  ✅ Large order created and paid');
  }

  // Single item high-value order
  console.log('  Creating high-value single item order...');
  const highValueOrderResult = await initOrder();
  if (highValueOrderResult.success) {
    const highValueOrderId = highValueOrderResult.data.id;
    const expensiveProduct = createdProducts.find(p => p.price > 200 && p.stockQuantity > 0);
    
    if (expensiveProduct) {
      await createOrderItem(highValueOrderId, expensiveProduct.id, 1);
      await payOrder(highValueOrderId);
      console.log(`  ✅ High-value order: 1x ${expensiveProduct.name}`);
    }
  }

  console.log('\n🎉 Database seeding completed!\n');
  
  // Summary
  console.log('📊 Seeding Summary:');
  console.log(`  📦 Products created: ${createdProducts.length}`);
  console.log(`  🛒 Orders created: ${createdOrders.length + 2}`); // +2 for edge cases
  console.log(`  💰 Product price range: $${Math.min(...createdProducts.map(p => p.price)).toFixed(2)} - $${Math.max(...createdProducts.map(p => p.price)).toFixed(2)}`);
  console.log(`  📊 Stock levels: ${createdProducts.filter(p => p.stockQuantity === 0).length} out of stock, ${createdProducts.filter(p => p.stockQuantity < 10).length} low stock`);
  
  console.log('\n🚀 Ready for testing! Open your frontend at http://localhost:3000');
  console.log('💡 You should now see products with varied stock levels, prices, and sales data.');
};

// Error handling
const handleError = (error) => {
  console.error('\n💥 Seeding failed:', error.message);
  process.exit(1);
};

// Run the seeding
if (require.main === module) {
  seedDatabase().catch(handleError);
}

module.exports = { seedDatabase };
