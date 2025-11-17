# CSV Bulk Upload Guide - Radha Sarees Admin

## 📋 Overview

The bulk upload feature allows you to add multiple products at once using a CSV (Comma-Separated Values) file. This is much faster than adding products one by one when you have a large inventory.

## 🎯 How to Use CSV Upload

### Step 1: Access Bulk Upload
1. Login to the admin panel (username: `admin`, password: `admin123`)
2. Navigate to **Products** tab
3. Click the **"Bulk Upload"** button (next to "Add Product")

### Step 2: Prepare Your CSV File

#### Required Format
Your CSV file must have these columns in **exact order**:
```
name, price, originalPrice, image, weight, category, description
```

#### Example CSV Content
```csv
name,price,originalPrice,image,weight,category,description
Royal Banarasi Silk Saree,18999,25999,/images/banarasi-red.jpg,Pure Silk,Wedding,Luxurious Banarasi silk with zari work
Kanjeevaram Wedding Saree,24999,32999,/images/kanjeevaram.jpg,Kanjivaram Silk,Wedding,Authentic Kanjeevaram with golden border
Designer Embroidered Saree,15999,21999,/images/designer.jpg,Georgette,Ethnic,Contemporary designer saree
Cotton Casual Saree,5999,7999,/images/cotton.jpg,Cotton,Casuals,Comfortable everyday wear
Festival Silk Saree,12999,16999,/images/festival.jpg,Art Silk,Festival,Perfect for festive occasions
Celebrity Style Saree,19999,24999,/images/celebrity.jpg,Chiffon,Celebrity,Bollywood inspired design
```

### Step 3: Download Sample CSV
1. In the bulk upload dialog, click **"Download Sample CSV"**
2. This downloads a pre-formatted CSV file with example products
3. Open it in Excel, Google Sheets, or any text editor
4. Use it as a template for your own products

### Step 4: Upload Your CSV File

You have two options:

**Option A: Drag & Drop** (Recommended)
1. Drag your CSV file from your computer
2. Drop it into the upload area in the dialog
3. File name and size will appear
4. Click **"Upload Products from CSV"**

**Option B: Browse Files**
1. Click **"Browse Files"** button
2. Select your CSV file from your computer
3. File name and size will appear
4. Click **"Upload Products from CSV"**

### Step 5: Verify Upload
1. Success message shows number of products added
2. Check the Products grid to see new products
3. All products appear immediately in the catalog

## 📝 CSV Column Details

### 1. name (Required)
- Product name
- Example: `Royal Banarasi Silk Saree - Bridal Red`
- Can include special characters and spaces

### 2. price (Required)
- Current selling price in rupees (₹)
- Numbers only, no currency symbols
- Example: `18999` (for ₹18,999)

### 3. originalPrice (Optional)
- Original/MRP price before discount
- Leave empty if no original price
- Example: `25999` or leave blank
- Used to calculate discount percentage

### 4. image (Required)
- Path to product image
- Format: `/images/filename.jpg`
- Example: `/images/banarasi-silk-red.jpg`
- Make sure images exist at these paths

### 5. weight (Required)
- Fabric type or weight
- Example: `Pure Silk`, `Cotton Blend`, `Georgette`
- This field describes the material

### 6. category (Required)
- Must be one of these exact values:
  - `Wedding`
  - `Ethnic`
  - `Casuals`
  - `Festival`
  - `New Arrivals`
  - `Celebrity`
- Case-sensitive! Use exact capitalization

### 7. description (Optional)
- Product description
- Example: `Luxurious Banarasi silk saree with intricate zari work`
- Can be left empty
- Avoid commas in description (use semicolons instead)

## ⚙️ Default Values

When uploading via CSV, these values are set automatically:

- **Rating**: 4.5
- **Reviews**: 0
- **isOrganic**: false
- **inStock**: true

You can edit these individually after upload if needed.

## ✅ CSV File Requirements

### Format
- ✅ File extension must be `.csv`
- ✅ First row must be header row (column names)
- ✅ Data starts from second row
- ✅ Use commas to separate values
- ✅ No extra blank rows

### Encoding
- ✅ UTF-8 encoding (standard for Excel/Google Sheets)
- ✅ Plain text format

### Size
- ✅ No file size limit
- ✅ Can upload hundreds of products at once

## 🔧 Creating CSV Files

### Using Microsoft Excel
1. Create new spreadsheet
2. Add column headers in first row
3. Add product data in subsequent rows
4. **File → Save As → CSV (Comma delimited) (*.csv)**
5. Choose location and save

### Using Google Sheets
1. Create new spreadsheet
2. Add column headers in first row
3. Add product data in subsequent rows
4. **File → Download → Comma Separated Values (.csv)**
5. File downloads to your computer

### Using Text Editor
1. Open Notepad (Windows) or TextEdit (Mac)
2. Type header row: `name,price,originalPrice,image,weight,category,description`
3. Add data rows, each on a new line
4. Save with `.csv` extension
5. Make sure "Save as type" is "All Files"

## 🚫 Common Mistakes to Avoid

### ❌ Wrong Column Order
```csv
price,name,category,description  ❌ WRONG ORDER
```
**Fix:** Use exact order shown above

### ❌ Missing Commas
```csv
Royal Saree 18999 Wedding  ❌ NO COMMAS
```
**Fix:** Separate with commas: `Royal Saree,18999,,/images/saree.jpg,Silk,Wedding,Description`

### ❌ Commas in Description
```csv
Saree,18999,,/images/s.jpg,Silk,Wedding,Beautiful, elegant design  ❌ EXTRA COMMA
```
**Fix:** Avoid commas in descriptions or wrap in quotes: `"Beautiful, elegant design"`

### ❌ Wrong Category Names
```csv
Saree,18999,,/images/s.jpg,Silk,wedding,Description  ❌ LOWERCASE
Saree,18999,,/images/s.jpg,Silk,Bridal,Description  ❌ INVALID
```
**Fix:** Use exact category names: `Wedding`, `Ethnic`, `Casuals`, `Festival`, `New Arrivals`, `Celebrity`

### ❌ Missing Header Row
```csv
Royal Saree,18999,25999...  ❌ NO HEADER
```
**Fix:** First row must be: `name,price,originalPrice,image,weight,category,description`

### ❌ Currency Symbols in Price
```csv
Royal Saree,₹18999,₹25999...  ❌ HAS SYMBOLS
```
**Fix:** Numbers only: `Royal Saree,18999,25999...`

## 📊 Example Use Cases

### Case 1: New Store Setup
**Scenario:** Adding 100 products at launch
1. Download sample CSV
2. Fill in all 100 products in Excel
3. Save as CSV
4. Upload once
5. All products added in seconds!

### Case 2: Seasonal Collection
**Scenario:** Adding 25 festival sarees
1. Create CSV with festival collection
2. Set category to "Festival"
3. Upload CSV
4. Festival products instantly available

### Case 3: Price Updates
**Scenario:** Updating original prices for sale
1. Export current products (or recreate CSV)
2. Update originalPrice column
3. Upload CSV (products with same names will be added as new)
4. Delete old products if needed

## 🎨 Design System Compliance

The bulk upload feature uses all design system CSS variables:

- **Colors**: Primary blue, muted backgrounds
- **Typography**: Inter font family
- **Spacing**: Consistent padding and margins
- **Icons**: FileSpreadsheet, Upload, Download, X icons
- **Transitions**: Smooth hover effects

## 🔍 Troubleshooting

### Problem: "Please upload a valid CSV file"
**Solution:** 
- Make sure file extension is `.csv`
- Save as CSV format, not Excel (.xlsx)
- File type must be `text/csv`

### Problem: No products appear after upload
**Solution:**
- Check browser console for errors (F12)
- Verify CSV format matches exactly
- Make sure header row is present
- Check for extra commas or missing values

### Problem: Products appear with wrong data
**Solution:**
- Verify column order is correct
- Check for commas in description field
- Ensure categories match exactly
- Numbers should not have currency symbols

### Problem: "Error parsing CSV data"
**Solution:**
- Check for missing required columns
- Verify no empty rows
- Make sure all prices are valid numbers
- Check for special characters

## 💡 Pro Tips

1. **Start Small**: Test with 2-3 products first before uploading 100+
2. **Use Sample**: Always download and modify the sample CSV
3. **Excel Power**: Use Excel formulas to auto-generate image paths
4. **Backup**: Keep a copy of your CSV file for future updates
5. **Validation**: Open CSV in text editor to verify format before upload
6. **Batch Processing**: Group products by category for easier management
7. **Image Naming**: Use consistent naming for images (e.g., `saree-001.jpg`)

## 📞 Need Help?

If you encounter issues:
1. Download the sample CSV and compare format
2. Check the CSV column order matches exactly
3. Verify category names are spelled correctly
4. Ensure file is saved as `.csv`, not `.xlsx`
5. Try uploading a single product first to test

## Summary

✅ CSV bulk upload saves time when adding many products  
✅ Use exact column order: name, price, originalPrice, image, weight, category, description  
✅ Download sample CSV as a template  
✅ Drag & drop or browse to upload  
✅ All products added instantly  
✅ Default values set automatically  
✅ Full design system compliance  

**Ready to bulk upload? Login to admin panel and click "Bulk Upload"!** 🚀
