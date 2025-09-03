# Commerce Frontend - Product Management Dashboard

A modern React TypeScript application for managing products in the Commerce API system.

## Features

- **Product Management**: View, create, update, and delete products
- **Advanced Filtering**: Filter by name, stock quantity, price, sold count, and sold sum
- **Sorting**: Sort products by any column
- **Smart Auto-Refresh**: Automatic polling every 15 seconds with intelligent pausing
- **Manual Refresh**: Instant refresh button for immediate updates
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Built with Material-UI components
- **Form Validation**: Client-side validation matching backend requirements
- **Error Handling**: Proper error handling for API responses

## Technology Stack

- React 18 with TypeScript
- Material-UI (MUI) for components and styling
- MUI X Data Grid for advanced table functionality
- React Hook Form with Yup validation
- Axios for API communication
- Responsive design with CSS Grid and Flexbox

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Commerce API backend running on `http://localhost:8080`

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

The application will open at `http://localhost:3000`.

### Database Seeding

To populate your database with realistic grocery store test data:

```bash
npm run seed              # Simple seeding with 25+ products and ~30 orders
npm run seed-advanced     # Advanced seeding with progress tracking
npm run seed-quick        # Faster seeding for quick testing
./seed-database.sh        # Bash version (uses curl)
```

**Prerequisites**: Backend API must be running on `http://localhost:8080`

The seeding creates:
- 25+ grocery products (produce, dairy, meat, pantry items, etc.)
- Varied stock levels (out-of-stock, low-stock, normal stock)
- Realistic pricing ($1.49 - $14.99)
- Orders in different states (paid, cancelled, pending)
- Sales data for testing soldCount and soldSum metrics

See [SEEDING.md](./SEEDING.md) for detailed documentation.

### Production Build

```bash
npm run build
```

## API Integration

The application connects to the Commerce API backend and uses the following endpoints:

- `GET /api/products` - Fetch all products
- `POST /api/products` - Create a new product
- `PUT /api/products/{productId}` - Update an existing product
- `DELETE /api/products/{productId}` - Delete a product

## Product Data Structure

Each product contains:
- **ID**: Unique identifier (UUID)
- **Name**: Product name (required, non-blank)
- **Price**: Product price (required, minimum $0.01)
- **Stock Quantity**: Available stock (required, minimum 0)
- **Created At**: Timestamp when product was created
- **Sold Count**: Total number of units sold
- **Sold Sum**: Total revenue from sales

## Validation Rules

The frontend validation matches the backend requirements:
- Product name: Required, cannot be blank
- Price: Required, must be at least $0.01
- Stock quantity: Required, cannot be negative

## Error Handling

The application handles various error scenarios:
- Network errors
- Validation errors
- Business logic errors (e.g., product not found, product has active orders)
- Server errors

Error messages are displayed in user-friendly alerts with appropriate actions.

## Auto-Refresh & Polling

The application includes smart polling functionality:

- **15-second interval**: Automatically refreshes product data every 15 seconds
- **Smart pausing**: Polling pauses during user interactions (forms, dialogs)
- **Visibility detection**: Polling stops when browser tab is hidden
- **Manual controls**: Users can manually refresh or toggle auto-refresh
- **Visual indicators**: Status chip shows polling state and last refresh time
- **Background updates**: Polling doesn't interfere with user experience

### Polling Controls

- **Refresh Button**: Manual refresh for immediate updates
- **Play/Pause Button**: Toggle auto-refresh on/off
- **Status Indicator**: Shows current polling state
- **Last Updated**: Displays timestamp of last data refresh (desktop only)