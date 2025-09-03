#!/bin/bash

# Database Seeding Script for Commerce API
# Creates realistic test data using curl commands

API_BASE="http://localhost:8080/api"

echo "🌱 Starting database seeding with curl..."
echo

# Check if API is available
echo "🔍 Checking API availability..."
if ! curl -s -f "$API_BASE/products" > /dev/null; then
    echo "❌ API is not available. Please ensure the backend is running on http://localhost:8080"
    exit 1
fi
echo "✅ API is available"
echo

# Array to store created product IDs
declare -a PRODUCT_IDS=()

# Function to create product
create_product() {
    local name="$1"
    local price="$2"
    local stock="$3"
    
    echo "  Creating: $name"
    local response=$(curl -s -X POST "$API_BASE/products" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$name\",\"price\":$price,\"stockQuantity\":$stock}")
    
    if [[ $? -eq 0 ]]; then
        local product_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        PRODUCT_IDS+=("$product_id")
        echo "  ✅ Created: $name (ID: $product_id)"
        return 0
    else
        echo "  ❌ Failed: $name"
        return 1
    fi
}

# Function to create order with items
create_order_with_items() {
    local scenario="$1"
    local should_pay="$2"
    local should_cancel="$3"
    
    # Initialize order
    local order_response=$(curl -s -X POST "$API_BASE/orders/init")
    local order_id=$(echo "$order_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [[ -z "$order_id" ]]; then
        echo "    ❌ Failed to create order"
        return 1
    fi
    
    # Add random items (1-4 items per order)
    local item_count=$((RANDOM % 4 + 1))
    local items_added=0
    
    for ((i=1; i<=item_count; i++)); do
        if [[ ${#PRODUCT_IDS[@]} -eq 0 ]]; then
            break
        fi
        
        # Select random product
        local random_index=$((RANDOM % ${#PRODUCT_IDS[@]}))
        local product_id="${PRODUCT_IDS[$random_index]}"
        local quantity=$((RANDOM % 5 + 1))
        
        curl -s -X POST "$API_BASE/orders/$order_id/items" \
            -H "Content-Type: application/json" \
            -d "{\"productId\":\"$product_id\",\"quantity\":$quantity}" > /dev/null
        
        if [[ $? -eq 0 ]]; then
            ((items_added++))
        fi
        
        sleep 0.1
    done
    
    echo "    Order: $items_added items added"
    
    # Apply scenario action
    if [[ "$should_pay" == "true" ]]; then
        curl -s -X POST "$API_BASE/orders/$order_id/pay" > /dev/null
        echo "    ✅ Order paid"
    elif [[ "$should_cancel" == "true" ]]; then
        curl -s -X POST "$API_BASE/orders/$order_id/cancel" > /dev/null
        echo "    🚫 Order cancelled"
    else
        echo "    ⏳ Order left pending"
    fi
    
    sleep 0.2
}

echo "📦 Creating products..."

# Create grocery store products with varied stock levels
create_product "Organic Bananas (2 lbs)" 2.99 150
create_product "Hass Avocados (4 pack)" 5.99 85
create_product "Fresh Strawberries (1 lb)" 6.99 0
create_product "Organic Baby Spinach (5 oz)" 3.99 45
create_product "Roma Tomatoes (2 lbs)" 4.49 120
create_product "Organic Whole Milk (1 gal)" 4.99 75
create_product "Free Range Eggs (12 ct)" 4.49 90
create_product "Greek Yogurt Vanilla (32 oz)" 6.99 60
create_product "Sharp Cheddar Cheese (8 oz)" 5.49 8
create_product "Boneless Chicken Breast (1 lb)" 8.99 40
create_product "Ground Beef 85/15 (1 lb)" 7.49 35
create_product "Fresh Atlantic Salmon (1 lb)" 14.99 2
create_product "Spaghetti Pasta (1 lb)" 1.49 200
create_product "Jasmine Rice (5 lbs)" 7.99 100
create_product "Extra Virgin Olive Oil (500ml)" 12.99 45
create_product "Artisan Sourdough Loaf" 5.99 30
create_product "Butter Croissants (6 pack)" 7.99 12
create_product "Fresh Orange Juice (64 oz)" 5.99 70
create_product "Colombian Coffee Beans (12 oz)" 14.99 7
create_product "Organic Frozen Blueberries (1 lb)" 7.99 40
create_product "Premium Vanilla Ice Cream (1.5 qt)" 6.99 0
create_product "Dark Chocolate 70% (3.5 oz)" 5.99 90
create_product "Roasted Mixed Nuts (1 lb)" 11.99 55
create_product "Organic Honey (12 oz)" 8.99 35
create_product "Coconut Oil Virgin (14 oz)" 9.99 25

echo
echo "📦 Created ${#PRODUCT_IDS[@]} products"
echo

# Create orders with different scenarios
echo "🛒 Creating completed orders..."
for i in {1..15}; do
    create_order_with_items "completed" "true" "false"
done

echo
echo "🛒 Creating cancelled orders..."
for i in {1..5}; do
    create_order_with_items "cancelled" "false" "true"
done

echo
echo "🛒 Creating pending orders..."
for i in {1..8}; do
    create_order_with_items "pending" "false" "false"
done

echo
echo "🎯 Creating edge case scenarios..."

# Large order
echo "  Creating large order..."
large_order_response=$(curl -s -X POST "$API_BASE/orders/init")
large_order_id=$(echo "$large_order_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [[ -n "$large_order_id" ]]; then
    # Add many items
    for i in {1..10}; do
        if [[ ${#PRODUCT_IDS[@]} -gt 0 ]]; then
            random_index=$((RANDOM % ${#PRODUCT_IDS[@]}))
            product_id="${PRODUCT_IDS[$random_index]}"
            quantity=$((RANDOM % 8 + 3))
            
            curl -s -X POST "$API_BASE/orders/$large_order_id/items" \
                -H "Content-Type: application/json" \
                -d "{\"productId\":\"$product_id\",\"quantity\":$quantity}" > /dev/null
            sleep 0.05
        fi
    done
    
    curl -s -X POST "$API_BASE/orders/$large_order_id/pay" > /dev/null
    echo "  ✅ Large order created and paid"
fi

echo
echo "🎉 Database seeding completed!"
echo
echo "📊 Summary:"
echo "  📦 Products: ${#PRODUCT_IDS[@]} with varied stock levels"
echo "  🛒 Orders: ~28 orders (15 paid, 5 cancelled, 8 pending + edge cases)"
echo "  💡 Stock levels: Mix of in-stock, low-stock, and out-of-stock products"
echo "  💰 Price range: $9.99 - $1,299.99"
echo
echo "🚀 Ready for testing! Open your frontend at http://localhost:3000"
echo "💡 You should now see products with realistic sales data and varied states."
