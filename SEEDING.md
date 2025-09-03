# Database Seeding Guide

This guide provides multiple options for populating your Commerce API database with realistic test data using the backend API endpoints.

## 🚀 Quick Start

### Prerequisites
1. **Backend API running** on `http://localhost:8080`
2. **Node.js installed** (for JavaScript scripts)
3. **curl available** (for bash script)

### Option 1: Simple Node.js Script (Recommended)
```bash
npm run seed
```

### Option 2: Advanced Node.js Script
```bash
npm run seed-advanced          # Full seeding with all features
npm run seed-quick            # Faster seeding with fewer orders
npm run seed-products         # Products only, no orders
```

### Option 3: Bash Script (curl-based)
```bash
./seed-database.sh
```

## 📊 What Gets Created

### Products (25+ items)
- **Fresh Produce**: Bananas, avocados, strawberries, spinach, tomatoes, carrots
- **Dairy & Eggs**: Organic milk, free-range eggs, Greek yogurt, cheese, butter
- **Meat & Seafood**: Chicken breast, ground beef, salmon, pork tenderloin, deli turkey
- **Pantry Staples**: Pasta, rice, olive oil, salt, pepper, canned tomatoes
- **Bakery**: Sourdough bread, croissants, bagels, sandwich bread
- **Beverages**: Orange juice, coffee beans, tea, sparkling water
- **Frozen Foods**: Blueberries, ice cream, pizza, mixed vegetables
- **Snacks & Health**: Dark chocolate, nuts, granola, honey, coconut oil

### Stock Level Distribution
- **Out of Stock**: 3-4 products (0 quantity)
- **Low Stock**: 6-8 products (1-9 quantity)
- **Normal Stock**: 10-15 products (10-50 quantity)
- **High Stock**: 5-8 products (50+ quantity)

### Orders (~30 orders total)
- **Paid Orders**: 15-23 orders (completed purchases)
- **Cancelled Orders**: 5-7 orders (cancelled before payment)
- **Pending Orders**: 8-10 orders (awaiting payment)
- **Edge Cases**: Large orders, single-item orders

### Order Items
- **Varied Quantities**: 1-15 items per order
- **Realistic Distribution**: More common products appear more frequently
- **Stock Impact**: Orders reduce product stock quantities

## 🎯 Test Scenarios Created

### Frontend Testing
1. **Filtering Tests**
   - Products with $0 stock (out of stock)
   - Products with stock < 10 (low stock warning)
   - Price ranges from $1.49 to $14.99 (realistic grocery prices)
   - Products with high soldCount (popular items)
   - Products with high soldSum (revenue generators)

2. **Sorting Tests**
   - Sort by price ($1.49 to $14.99 - grocery range)
   - Sort by stock (0 to 200+ - realistic grocery inventory)
   - Sort by soldCount (popular vs niche grocery items)
   - Sort by soldSum (high-volume vs premium products)
   - Sort by creation date

3. **CRUD Operations**
   - Update products with different stock levels
   - Delete products (some may have order restrictions)
   - Create new products

### Backend Testing
1. **Business Logic**
   - Stock validation (insufficient stock scenarios)
   - Order state transitions (pending → paid/cancelled)
   - Product deletion restrictions (products with orders)

2. **Error Scenarios**
   - Out of stock product ordering
   - Invalid order state changes
   - Product not found errors

## 🛠️ Seeding Script Features

### Smart Seeding
- **API Health Check**: Verifies backend availability
- **Error Recovery**: Retries failed requests with exponential backoff
- **Progress Tracking**: Real-time progress updates
- **Realistic Data**: Varied grocery categories and realistic pricing from $1.49 to $14.99

### Configurable Options
```bash
node advanced-seed.js --help      # Show all options
node advanced-seed.js --quick     # Faster seeding
node advanced-seed.js --verbose   # Detailed logging
node advanced-seed.js --products-only  # Skip order creation
```

### Data Realism
- **Product Categories**: Organized by type (Electronics, Office, etc.)
- **Price Distribution**: Realistic pricing from $9.99 to $2,499.99
- **Stock Patterns**: Some popular items have low stock due to sales
- **Order Patterns**: Varied order sizes and frequencies
- **Sales History**: Products get soldCount/soldSum from completed orders

## 🔄 Re-seeding

To re-seed the database:
1. **Clear existing data** (restart backend or clear database)
2. **Run seeding script** again
3. **Refresh frontend** to see new data

## 🐛 Troubleshooting

### Common Issues

**"API not available"**
- Ensure backend is running on port 8080
- Check CORS configuration
- Verify database connectivity

**"Product creation failed"**
- Check for duplicate product names
- Verify validation rules
- Check database constraints

**"Order creation failed"**
- Ensure products exist first
- Check product stock availability
- Verify order state transitions

### Debug Mode
```bash
node advanced-seed.js --verbose
```

## 📈 Expected Results

After seeding, your frontend should display:
- **~25 products** with varied properties
- **Statistics cards** showing realistic inventory values
- **Filter functionality** with meaningful data ranges
- **Stock status indicators** (red, yellow, green chips)
- **Sorting capabilities** with diverse data points
- **Sales metrics** from completed orders

The grocery data is designed to showcase all frontend features and provide comprehensive testing scenarios for both UI and API functionality, with realistic e-commerce grocery store scenarios.
