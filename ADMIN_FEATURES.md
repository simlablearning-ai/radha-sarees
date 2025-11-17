# Radha Sarees - Admin Panel Features

## Overview
Complete admin panel integrated with the Radha Sarees ecommerce website featuring secure login, product management, order tracking, reporting, and payment gateway configuration.

## 🔒 Authentication System

### Login Credentials
**Default Admin Account:**
- Username: `admin`
- Password: `admin123`

**⚠️ Important:** Change these credentials in production by modifying the login logic in `/lib/store.ts`

### Security Features
- ✅ Protected admin routes - requires login
- ✅ Session persistence using localStorage
- ✅ Logout functionality
- ✅ Automatic redirect to login if not authenticated
- ✅ Login state persists across page refreshes

### How to Login
1. Navigate to `#admin` or click "Admin Panel" button
2. Enter username: `admin`
3. Enter password: `admin123`
4. Click "Login"
5. Access granted to admin panel

### How to Logout
1. Click "Logout" button in admin sidebar (bottom)
2. Automatically redirected to login screen
3. Session cleared from storage

### Customizing Credentials
Edit `/lib/store.ts` and modify the login function:
```typescript
login: (username, password) => {
  if (username === 'admin' && password === 'admin123') {
    set({ isAdminAuthenticated: true, adminUsername: username });
    return true;
  }
  return false;
}
```

Change to your desired credentials or integrate with a backend authentication system.

## Features Implemented

### 1. 📦 Product Management

### Features
- ✅ Add new products with full details
- ✅ Edit existing products
- ✅ Delete products
- ✅ **Bulk delete - select multiple products**
- ✅ Search products by name/category
- ✅ **Bulk upload via CSV file**
- ✅ **WordPress-style table view with rows**
- ✅ Product images displayed in list
- ✅ Product stock management
- ✅ Select all products functionality

### WordPress-Style List View

Products are displayed in a professional table format (like WordPress admin):
- ✅ **Checkbox Column** - Select individual products or all at once
- ✅ **Image Column** - Product thumbnail (64x64px)
- ✅ **Product Name** - With description below
- ✅ **Category Badge** - Color-coded category tag
- ✅ **Fabric** - Material/weight information
- ✅ **Price** - Current and original price with strikethrough
- ✅ **Stock Status** - Green "In Stock" or Red "Out of Stock" badge
- ✅ **Actions** - Edit and Delete buttons
- ✅ **Hover Effect** - Row highlights on hover

### How to Use Bulk Delete

**Select and Delete Multiple Products:**
1. Check the box next to each product you want to delete
   - OR -
2. Check the box in the header row to select ALL products
3. Click "Delete Selected (X)" button that appears
4. Confirm deletion
5. All selected products deleted instantly

**Features:**
- ✅ Select individual products
- ✅ Select all products at once
- ✅ Counter shows how many products selected
- ✅ "Delete Selected" button only appears when products are selected
- ✅ Confirmation dialog prevents accidental deletion
- ✅ Success toast shows count of deleted products

### How to Add Products

**Single Product:**
1. Click "Add Product" button
2. Fill in product details:
   - Product Name
   - Category (Wedding, Ethnic, Casuals, Festival, New Arrivals, Celebrity)
   - Price & Original Price
   - Image URL
   - Fabric/Weight
   - Description
   - Rating & Reviews
   - In Stock toggle
3. Click "Add Product"

**Bulk Upload via CSV:**
1. Click "Bulk Upload" button
2. Download the sample CSV file to see the format
3. Prepare your CSV file with columns in this exact order:
   ```
   name, price, originalPrice, image, weight, category, description
   ```
4. Upload your CSV file by:
   - **Drag & Drop:** Drag CSV file into the upload area
   - **Browse:** Click "Browse Files" to select CSV
5. Click "Upload Products from CSV"
6. All products from CSV will be added automatically

**CSV Format Example:**
```csv
name,price,originalPrice,image,weight,category,description
Royal Silk Saree,15999,19999,/images/saree1.jpg,Pure Silk,Wedding,Beautiful silk saree
Designer Saree,12999,16999,/images/saree2.jpg,Georgette,Ethnic,Elegant designer saree
Cotton Saree,5999,7999,/images/saree3.jpg,Cotton,Casuals,Comfortable cotton saree
```

**CSV Upload Features:**
- ✅ Drag and drop support
- ✅ File validation (CSV only)
- ✅ Download sample CSV template
- ✅ File preview before upload
- ✅ Automatic parsing and validation
- ✅ Success notification with count
- ✅ Error handling for invalid formats

### 2. **Order Management** ✅
- **View Orders**: Complete order listing with:
  - Order ID, Customer details
  - Item count, Total amount
  - Order status, Payment status
  - Order date
- **Edit Order Status**: Change order status
  - Pending → Processing → Shipped → Delivered
  - Cancelled option available
- **Order Details**: Full order information
  - Customer contact details
  - Shipping address
  - Payment method
  - Item breakdown
  - Status history
- **Filter Orders**: By status (all, pending, processing, shipped, delivered, cancelled)
- **Search Orders**: By order ID, customer name, or email

### 3. **Dashboard with Charts** ✅
- **Statistics Cards**:
  - Total Products
  - Total Orders
  - Revenue
  - Pending Orders
- **Sales Overview Chart**: Line chart showing monthly sales trends
- **Products by Category**: Pie chart distribution
- **Order Status Chart**: Bar chart of order statuses
- **Recent Orders**: Latest 5 orders with quick view
- **Theme Colors**: All charts use design system colors
  - chart-1: Primary blue
  - chart-2: Secondary blue
  - chart-3: Success green
  - chart-4: Warning orange
  - chart-5: Danger red

### 4. **Reports** ✅
- **Configure & Generate Reports**:
  - Sales Report
  - Inventory Report
  - Customer Report
  - Revenue Report
- **Date Range Selection**: Custom date ranges
- **Report Data**:
  - Sales: Total orders, revenue, top products
  - Inventory: Stock status, category breakdown
  - Customers: Total customers, repeat customers, top spenders
  - Revenue: Revenue by category, payment status breakdown
- **Download Reports**: Export as JSON
- **Delete Reports**: Remove old reports

### 5. **Payment Gateway Settings** ✅
- **Razorpay Integration**:
  - Enable/disable toggle
  - API Key configuration
  - Secret Key configuration
  - Setup instructions included
- **PhonePe Integration**:
  - Enable/disable toggle
  - Merchant ID configuration
  - Salt Key configuration
  - Setup instructions included
- **Cash on Delivery**: Always enabled
- **Payment Status Dashboard**: View active payment methods

### 6. **Navigation** ✅
- **Admin → Site**: "Visit Site" link in sidebar and header
- **Site → Admin**: Floating "Admin Panel" button (bottom right)
- Opens in new tab for easy switching

### 7. **Checkout Process** ✅
- **Customer Information Form**:
  - Full name, Email, Phone
  - Shipping address
- **Payment Method Selection**:
  - Razorpay (if enabled)
  - PhonePe (if enabled)
  - Cash on Delivery (always available)
- **Order Summary**: Item breakdown and total
- **Order Confirmation**: Success screen with details
- **Order Creation**: Automatically creates order in admin

### 8. **Data Synchronization** ✅
- **Shared Store**: Zustand store with persistence
- **Real-time Updates**: Products and orders sync instantly
- **Local Storage**: Data persists across sessions
- **Store Key**: `radha-sarees-store`

## Design System Compliance ✅

All components use the design system from `/styles/globals.css`:

### Typography
- Font Family: Inter
- Font Sizes: Uses CSS variables (--text-xs to --text-3xl)
- Font Weights: 400 (normal), 700 (bold)
- All text elements use defined font faces

### Colors
- Primary: Blue (#1E5EFF)
- Secondary: Light blue
- Success: Green (#06A561)
- Warning: Orange (#F99600)
- Danger: Red (#F0142F)
- Sidebar: Dark blue (#333752)
- All charts use theme colors

### Spacing & Borders
- Border Radius: var(--radius), var(--radius-card)
- Borders: var(--border)
- Shadows: var(--elevation-sm)

## File Structure

```
/
├── Admin.tsx                    # Main admin panel
├── admin.html                   # Admin entry point
├── App.tsx                      # Main storefront (updated)
├── lib/
│   └── store.ts                 # Zustand store with persistence
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx   # Dashboard with charts
│   │   ├── ProductManagement.tsx # Product CRUD + bulk upload
│   │   ├── OrderManagement.tsx   # Order viewing & editing
│   │   ├── ReportManagement.tsx  # Report generation
│   │   └── SettingsManagement.tsx # Payment gateway settings
│   ├── Checkout.tsx             # Checkout process
│   └── Cart.tsx                 # Shopping cart (updated)
└── styles/
    └── globals.css              # Design system
```

## Usage

### Access Admin Panel
1. Click "Admin Panel" button on the storefront (bottom right)
2. Or navigate to `#admin` in the URL (e.g., `https://yoursite.com/#admin`)

### Navigate Between Store and Admin
- **From Store to Admin**: Click the floating "Admin Panel" button (bottom right)
- **From Admin to Store**: Click "Visit Site" in sidebar or "View Store" button in header
- Both use hash-based routing for seamless navigation

### Add Products
1. Go to Products tab
2. Click "Add Product"
3. Fill in all details
4. Submit to add to catalog

### Bulk Upload Products
1. Click "Bulk Upload"
2. Enter CSV data in format:
   ```
   name,price,originalPrice,image,weight,category,description
   Royal Silk Saree,15999,19999,/images/saree1.jpg,Pure Silk,Wedding,Beautiful silk saree
   ```
3. Click "Upload Products"

### Manage Orders
1. Go to Orders tab
2. Click on any order to view details
3. Change status using dropdown
4. Filter or search orders as needed

### Generate Reports
1. Go to Reports tab
2. Select report type
3. Choose date range
4. Click "Generate Report"
5. Download or delete reports

### Configure Payment Gateways
1. Go to Settings tab
2. Select Payment Gateways
3. Enable Razorpay/PhonePe
4. Enter API credentials
5. Save settings

### Customer Checkout Flow
1. Browse products on storefront
2. Add items to cart
3. Click "Proceed to Checkout"
4. Enter customer details
5. Select payment method
6. Place order
7. Order appears in admin panel

## Data Persistence
All data is stored in browser localStorage under key `radha-sarees-store` including:
- Products
- Orders
- Payment gateway settings
- Generated reports

## Notes
- All image paths use placeholder format `/images/...`
- Replace with actual saree images
- Payment gateways require valid API credentials for production
- Charts use Recharts library with theme colors
- All components follow Inter font family from design system