import { useState, useRef } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Plus, Edit, Trash2, Search, Package, Upload, Download, Filter, FileSpreadsheet, X, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductFormData {
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  weight: string;
  tags: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  hasVariations: boolean;
  variations: Array<{
    id: string;
    color: string;
    stock: number;
    priceAdjustment: number;
    image: string;
  }>;
}

export function ProductManagement() {
  const { products } = useStore();
  
  // Ensure products is always an array to prevent crashes
  const safeProducts = Array.isArray(products) ? products : [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [bulkCSV, setBulkCSV] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bulkEditData, setBulkEditData] = useState({
    category: "",
    priceAdjustment: 0,
    adjustmentType: "percentage",
    tags: "",
  });
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    originalPrice: 0,
    category: "Wedding",
    description: "",
    image: "",
    stock: 0,
    weight: "",
    tags: "",
    rating: 5,
    reviews: 0,
    inStock: true,
    hasVariations: false,
    variations: [],
  });

  const categories = ["Semi Silk Sarees", "Cotton Sarees", "Boutique Sarees", "Party wear sarees", "Under Rs.499"];

  // Helper function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle main product image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setFormData({ ...formData, image: base64 });
      toast.success('Image uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  // Handle variation image upload
  const handleVariationImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      const newVariations = [...formData.variations];
      newVariations[index].image = base64;
      setFormData({ ...formData, variations: newVariations });
      toast.success('Variation image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    const success = await syncedActions.addProduct({
      name: formData.name,
      price: formData.price,
      originalPrice: formData.originalPrice,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      stock: formData.stock,
      weight: formData.weight,
      tags: tagsArray,
      rating: formData.rating,
      reviews: formData.reviews,
      inStock: formData.inStock,
      hasVariations: formData.hasVariations,
      variations: formData.variations,
    } as any);

    if (success) {
      toast.success("Product added successfully!");
      setIsAddDialogOpen(false);
      resetForm();
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    const success = await syncedActions.updateProduct(editingProduct.id, {
      name: formData.name,
      price: formData.price,
      originalPrice: formData.originalPrice,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      stock: formData.stock,
      weight: formData.weight,
      tags: tagsArray,
      rating: formData.rating,
      reviews: formData.reviews,
      inStock: formData.inStock,
      hasVariations: formData.hasVariations,
      variations: formData.variations,
    } as any);

    if (success) {
      toast.success("Product updated successfully!");
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await syncedActions.deleteProduct(productId);
      if (success) {
        toast.success("Product deleted successfully!");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }
    
    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
      try {
        // Use Promise.all to delete in parallel and ensure all complete
        const deletePromises = selectedProducts.map(id => syncedActions.deleteProduct(id));
        await Promise.all(deletePromises);
        toast.success(`${selectedProducts.length} products deleted!`);
        setSelectedProducts([]);
      } catch (error) {
        console.error("Bulk delete error:", error);
        toast.error("Some products could not be deleted. Please try again.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBulkCSV(event.target.result as string);
          toast.success("CSV file loaded!");
        }
      };
      reader.readAsText(file);
    } else {
      toast.error("Please drop a valid CSV file");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBulkCSV(event.target.result as string);
          toast.success("CSV file loaded!");
        }
      };
      reader.readAsText(file);
    }
  };

  // Improved CSV Parser that handles quoted strings and newlines correctly
  const parseCSV = (text: string) => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuote = false;
    let currentToken = '';
    
    // Normalize newlines
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];
      const nextChar = normalizedText[i + 1];
      
      if (inQuote) {
        if (char === '"' && nextChar === '"') {
          currentToken += '"';
          i++; // Skip the escaped quote
        } else if (char === '"') {
          inQuote = false;
        } else {
          currentToken += char;
        }
      } else {
        if (char === '"') {
          inQuote = true;
        } else if (char === ',') {
          row.push(currentToken.trim());
          currentToken = '';
        } else if (char === '\n') {
          row.push(currentToken.trim());
          if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
             result.push(row);
          }
          row = [];
          currentToken = '';
        } else {
          currentToken += char;
        }
      }
    }
    
    // Push the last token/row if exists
    if (currentToken || row.length > 0) {
      row.push(currentToken.trim());
      if (row.length > 0) {
        result.push(row);
      }
    }
    
    return result;
  };

  const processCSV = async (csvContent: string) => {
    try {
      const parsedRows = parseCSV(csvContent);
      
      if (parsedRows.length < 2) {
        toast.error("CSV must have header and at least one product row");
        return;
      }

      const headers = parsedRows[0].map(h => h.trim().toLowerCase());
      const products = [];

      for (let i = 1; i < parsedRows.length; i++) {
        const values = parsedRows[i];
        
        // Skip empty rows
        if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

        const product: any = {};
        
        headers.forEach((header, index) => {
          // Handle case where row might have fewer columns than header
          const value = index < values.length ? values[index] : '';
          
          // Map CSV headers to correct product property names
          let propertyName = header;
          if (header === 'originalprice') propertyName = 'originalPrice';
          if (header === 'instock') propertyName = 'inStock';
          if (header === 'hasvariations') propertyName = 'hasVariations';
          
          if (['price', 'originalPrice', 'stock', 'rating', 'reviews'].includes(propertyName)) {
            // Remove currency symbols or commas if present
            const numericVal = value.replace(/[₹$,]/g, '');
            product[propertyName] = Number(numericVal) || 0;
          } else if (propertyName === 'inStock' || propertyName === 'hasVariations') {
            const lowerVal = value.toLowerCase();
            product[propertyName] = lowerVal === 'true' || lowerVal === '1' || lowerVal === 'yes';
          } else if (propertyName === 'tags') {
            product[propertyName] = value ? value.split(';').map(t => t.trim()).filter(t => t) : [];
          } else if (propertyName === 'variations') {
            // Parse color variations: color:stock:priceAdjustment:imageURL|...
            if (value && value.trim()) {
              const variationStrings = value.split('|');
              product[propertyName] = variationStrings.map((varStr, idx) => {
                const parts = varStr.split(':');
                return {
                  id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
                  color: parts[0] || '',
                  stock: Number(parts[1]) || 0,
                  priceAdjustment: Number(parts[2]) || 0,
                  image: parts[3] || ''
                };
              }).filter(v => v.color); 
            } else {
              product[propertyName] = [];
            }
          } else {
            product[propertyName] = value || '';
          }
        });

        if (product.name && product.category) {
          // Ensure variations array exists if hasVariations is true
          if (product.hasVariations && (!product.variations || product.variations.length === 0)) {
             product.variations = [];
          }
          products.push(product);
        }
      }
      
      if (products.length === 0) {
        toast.error("No valid products found in CSV. Please check required columns (name, category).");
        return;
      }

      // Use bulk add API if available, or loop
      if (syncedActions.bulkAddProducts) {
        await syncedActions.bulkAddProducts(products);
      } else {
        // Fallback to sequential add
        for (const product of products) {
          await syncedActions.addProduct(product);
        }
      }

      toast.success(`${products.length} products uploaded successfully!`);
      setIsBulkUploadOpen(false);
      setBulkCSV("");
    } catch (error) {
      console.error("CSV Processing Error:", error);
      toast.error("Error parsing CSV. Please check console for details.");
    }
  };

  const handleBulkEdit = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    try {
      const updates: any = {};
      if (bulkEditData.category) updates.category = bulkEditData.category;

      // Prepare updates for all selected products
      const updatePromises = selectedProducts.map(async (id) => {
        const product = safeProducts.find(p => p.id === id);
        if (!product) return;

        const productUpdates = { ...updates };

        // Handle price adjustment
        if (bulkEditData.priceAdjustment !== 0) {
          if (bulkEditData.adjustmentType === 'percentage') {
            productUpdates.price = Math.round(product.price * (1 + bulkEditData.priceAdjustment / 100));
            if ((product as any).originalPrice) {
              productUpdates.originalPrice = Math.round((product as any).originalPrice * (1 + bulkEditData.priceAdjustment / 100));
            }
          } else {
            productUpdates.price = product.price + bulkEditData.priceAdjustment;
            if ((product as any).originalPrice) {
              productUpdates.originalPrice = (product as any).originalPrice + bulkEditData.priceAdjustment;
            }
          }
        }

        // Handle tags
        if (bulkEditData.tags) {
          const newTags = bulkEditData.tags.split(',').map(t => t.trim()).filter(t => t);
          // Avoid duplicates
          const currentTags = product.tags || [];
          const uniqueTags = [...new Set([...currentTags, ...newTags])];
          productUpdates.tags = uniqueTags;
        }

        if (Object.keys(productUpdates).length > 0) {
          await syncedActions.updateProduct(id, productUpdates);
        }
      });

      await Promise.all(updatePromises);

      toast.success(`${selectedProducts.length} products updated!`);
      setIsBulkEditOpen(false);
      setSelectedProducts([]);
      setBulkEditData({
        category: "",
        priceAdjustment: 0,
        adjustmentType: "percentage",
        tags: "",
      });
    } catch (error) {
      console.error("Bulk edit error:", error);
      toast.error("Failed to update some products.");
    }
  };

  const handleExportCSV = () => {
    const headers = ["name", "category", "price", "originalPrice", "stock", "weight", "image", "description", "tags", "rating", "reviews", "inStock", "hasVariations", "variations"];
    const rows = filteredProducts.map(p => {
      // Format variations as color:stock:priceAdjustment:imageURL|color:stock:priceAdjustment:imageURL
      const variationsStr = (p as any).hasVariations && (p as any).variations 
        ? (p as any).variations.map((v: any) => 
            `${v.color}:${v.stock}:${v.priceAdjustment || 0}:${v.image || ''}`
          ).join('|')
        : '';
      
      return [
        p.name,
        p.category,
        p.price,
        (p as any).originalPrice || p.price,
        p.stock || 0,
        (p as any).weight || "",
        p.image,
        p.description || "",
        (p.tags || []).join(';'),
        (p as any).rating || 5,
        (p as any).reviews || 0,
        (p as any).inStock !== false ? 'true' : 'false',
        (p as any).hasVariations ? 'true' : 'false',
        variationsStr,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Products exported!");
  };

  const downloadSampleCSV = () => {
    const sampleCSV = `name,category,price,originalPrice,stock,weight,image,description,tags,rating,reviews,inStock,hasVariations,variations
"Royal Silk Saree","Wedding",15999,19999,10,"Pure Silk","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400","Beautiful silk saree perfect for weddings","featured;new;bestseller",5,128,true,false,""
"Designer Saree with Colors","Ethnic",12999,16999,0,"Georgette","https://images.unsplash.com/photo-1583391733981-0b46bbf14a37?w=400","Elegant designer saree for special occasions - Available in multiple colors","featured;designer",4.5,95,true,true,"Red:10:0:|Blue:15:200:|Golden:8:500:"
"Cotton Saree","Casuals",5999,7999,20,"Cotton","https://images.unsplash.com/photo-1624206112918-f140f087f9db?w=400","Comfortable cotton saree for daily wear","new;casual",4.8,210,true,false,""`;

    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-products.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Sample CSV downloaded!");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: 0,
      originalPrice: 0,
      category: "Wedding",
      description: "",
      image: "",
      stock: 0,
      weight: "",
      tags: "",
      rating: 5,
      reviews: 0,
      inStock: true,
      hasVariations: false,
      variations: [],
    });
  };

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      category: product.category,
      description: product.description || "",
      image: product.image,
      stock: product.stock || 0,
      weight: product.weight || "",
      tags: product.tags ? product.tags.join(", ") : "",
      rating: product.rating || 5,
      reviews: product.reviews || 0,
      inStock: product.inStock !== false,
      hasVariations: product.hasVariations || false,
      variations: product.variations || [],
    });
    setIsEditDialogOpen(true);
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const filteredProducts = safeProducts.filter(product => {
    if (!product) return false;
    const productName = product.name || "";
    const productCategory = product.category || "";
    
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || productCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-foreground mb-2">Product Management</h2>
          <p className="text-muted-foreground">Manage your saree collection</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Bulk Upload Products</DialogTitle>
                <DialogDescription>
                  Upload multiple products using CSV format
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Download Sample */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-foreground">Sample CSV Template</p>
                      <p className="text-muted-foreground text-sm">Download to see the correct format</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadSampleCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample
                  </Button>
                </div>

                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground mb-2">Drag & Drop CSV File Here</p>
                  <p className="text-muted-foreground mb-4">or</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  {bulkCSV && (
                    <div className="mt-4 p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                      <p className="text-chart-3 text-sm">✓ CSV file loaded - ready to upload!</p>
                    </div>
                  )}
                </div>

                {/* CSV Format */}
                <div>
                  <Label>CSV Format (Required Columns)</Label>
                  <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground overflow-x-auto">
                    <code>
                      name,category,price,originalPrice,stock,weight,image,description,tags,rating,reviews,inStock,hasVariations,variations
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    • Tags should be separated by semicolons (;)
                    <br />
                    • inStock should be "true" or "false"
                    <br />
                    • All text values should be in quotes
                    <br />
                    • <strong>hasVariations</strong> should be "true" or "false"
                    <br />
                    • <strong>variations</strong> format: color:stock:priceAdjustment:imageURL|color:stock:priceAdjustment:imageURL
                    <br />
                    • Example variations: "Red:10:0:|Blue:15:200:https://...|Golden:5:500:"
                    <br />
                    • Leave priceAdjustment and imageURL empty if not needed (e.g., "Red:10::")
                  </p>
                </div>

                {/* Color Variations Example */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      ℹ️
                    </div>
                    <Label className="text-foreground">Color Variations Guide</Label>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p><strong>For products WITHOUT color variations:</strong></p>
                    <code className="block p-2 bg-background rounded text-[10px]">
                      hasVariations: false, variations: ""
                    </code>
                    <p className="mt-2"><strong>For products WITH color variations:</strong></p>
                    <code className="block p-2 bg-background rounded text-[10px]">
                      hasVariations: true, variations: "Red:10:0:|Blue:15:200:|Golden:8:500:"
                    </code>
                    <p className="text-muted-foreground/80 mt-2">
                      • Each variation separated by pipe (|)
                      <br />
                      • Format: ColorName:Stock:PriceAdjustment:ImageURL
                      <br />
                      • Stock must be added to variations, not main stock field
                    </p>
                  </div>
                </div>

                {/* Manual Paste Option */}
                <div>
                  <Label>Or Paste CSV Data Manually</Label>
                  <textarea
                    value={bulkCSV}
                    onChange={(e) => setBulkCSV(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
                    placeholder="Paste your CSV data here..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => processCSV(bulkCSV)} 
                    className="flex-1"
                    disabled={!bulkCSV}
                  >
                    Upload Products from CSV
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsBulkUploadOpen(false);
                    setBulkCSV("");
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new saree to your collection
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Royal Blue Silk Saree"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="2999"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                      placeholder="3999"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Shows as strikethrough</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Fabric/Weight</Label>
                    <Input
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., Pure Silk, Georgette"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image">Product Image *</Label>
                  
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mb-3 relative inline-block">
                      <ImageWithFallback
                        src={formData.image}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {/* File Upload Option */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Upload Image File
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="flex-1"
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Choose Image
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max size: 2MB • Formats: JPG, PNG, WebP
                      </p>
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-border"></div>
                      <span className="text-xs text-muted-foreground">OR</span>
                      <div className="flex-1 border-t border-border"></div>
                    </div>

                    {/* URL Input Option */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Paste Image URL
                      </Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        required={!formData.image}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Beautiful silk saree perfect for weddings..."
                    rows={3}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="featured, bestseller, new"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reviews">Number of Reviews</Label>
                    <Input
                      id="reviews"
                      type="number"
                      value={formData.reviews}
                      onChange={(e) => setFormData({ ...formData, reviews: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div>
                    <Label>In Stock Status</Label>
                    <p className="text-muted-foreground text-sm">Show this product as available</p>
                  </div>
                  <Switch
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                  />
                </div>

                {/* Color Variations Section */}
                <div className="border-2 border-primary/30 rounded-lg p-4 space-y-4 bg-primary/5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <Label className="text-lg">Color Variations</Label>
                      <p className="text-muted-foreground text-sm">Add multiple color options for this product</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Switch
                        checked={formData.hasVariations}
                        onCheckedChange={(checked) => {
                          if (checked && formData.variations.length === 0) {
                            // Add first variation by default
                            setFormData({ 
                              ...formData, 
                              hasVariations: checked,
                              variations: [{
                                id: Date.now().toString(),
                                color: '',
                                stock: 0,
                                priceAdjustment: 0,
                                image: ''
                              }]
                            });
                          } else {
                            setFormData({ ...formData, hasVariations: checked });
                          }
                        }}
                      />
                    </div>
                  </div>

                  {formData.hasVariations && (
                    <div className="space-y-3">
                      {formData.variations.map((variation, index) => (
                        <div key={variation.id} className="p-3 bg-background border border-border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Color Variation {index + 1}</Label>
                            {formData.variations.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newVariations = formData.variations.filter((_, i) => i !== index);
                                  setFormData({ ...formData, variations: newVariations });
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Color Name *</Label>
                              <Input
                                placeholder="e.g., Red, Blue, Golden"
                                value={variation.color}
                                onChange={(e) => {
                                  const newVariations = [...formData.variations];
                                  newVariations[index].color = e.target.value;
                                  setFormData({ ...formData, variations: newVariations });
                                }}
                                required={formData.hasVariations}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Stock *</Label>
                              <Input
                                type="number"
                                placeholder="10"
                                value={variation.stock}
                                onChange={(e) => {
                                  const newVariations = [...formData.variations];
                                  newVariations[index].stock = Number(e.target.value);
                                  setFormData({ ...formData, variations: newVariations });
                                }}
                                required={formData.hasVariations}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Price Adjustment (₹)</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={variation.priceAdjustment}
                                onChange={(e) => {
                                  const newVariations = [...formData.variations];
                                  newVariations[index].priceAdjustment = Number(e.target.value);
                                  setFormData({ ...formData, variations: newVariations });
                                }}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Extra charge for this color (+/-)
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs">Image (Optional)</Label>
                              
                              {/* Variation Image Preview */}
                              {variation.image && (
                                <div className="mb-2 relative inline-block">
                                  <ImageWithFallback
                                    src={variation.image}
                                    alt={`${variation.color} preview`}
                                    className="w-16 h-16 object-cover rounded border border-border"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full"
                                    onClick={() => {
                                      const newVariations = [...formData.variations];
                                      newVariations[index].image = '';
                                      setFormData({ ...formData, variations: newVariations });
                                    }}
                                  >
                                    <X className="h-2 w-2" />
                                  </Button>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleVariationImageUpload(e, index)}
                                  className="hidden"
                                  id={`variation-image-${index}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(`variation-image-${index}`)?.click()}
                                >
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  Upload
                                </Button>
                                <Input
                                  placeholder="or paste URL"
                                  className="text-xs"
                                  value={variation.image}
                                  onChange={(e) => {
                                    const newVariations = [...formData.variations];
                                    newVariations[index].image = e.target.value;
                                    setFormData({ ...formData, variations: newVariations });
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            variations: [
                              ...formData.variations,
                              {
                                id: Date.now().toString(),
                                color: '',
                                stock: 0,
                                priceAdjustment: 0,
                                image: ''
                              }
                            ]
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Color
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">Add Product</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {filteredProducts.length} products
          </span>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedProducts.length === filteredProducts.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-foreground">
                  {selectedProducts.length} selected
                </span>
              </div>
              <div className="flex gap-2">
                <Dialog open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Bulk Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Edit Products</DialogTitle>
                      <DialogDescription>
                        Edit {selectedProducts.length} selected products
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Change Category (optional)</Label>
                        <Select value={bulkEditData.category} onValueChange={(value) => setBulkEditData({ ...bulkEditData, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Keep existing" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Keep existing</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Price Adjustment</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            value={bulkEditData.priceAdjustment}
                            onChange={(e) => setBulkEditData({ ...bulkEditData, priceAdjustment: Number(e.target.value) })}
                            placeholder="0"
                          />
                          <Select value={bulkEditData.adjustmentType} onValueChange={(value: any) => setBulkEditData({ ...bulkEditData, adjustmentType: value })}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">%</SelectItem>
                              <SelectItem value="fixed">₹</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {bulkEditData.adjustmentType === 'percentage' ? 'Increase/decrease by percentage' : 'Add/subtract fixed amount'}
                        </p>
                      </div>

                      <div>
                        <Label>Add Tags (comma separated)</Label>
                        <Input
                          value={bulkEditData.tags}
                          onChange={(e) => setBulkEditData({ ...bulkEditData, tags: e.target.value })}
                          placeholder="sale, featured"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleBulkEdit} className="flex-1">
                          Apply Changes
                        </Button>
                        <Button variant="outline" onClick={() => setIsBulkEditOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedProducts.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* WordPress-Style Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Fabric</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const originalPrice = (product as any).originalPrice;
                    const weight = (product as any).weight;
                    const inStock = (product as any).inStock !== false;
                    
                    return (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedProducts.includes(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <ImageWithFallback
                            src={product.image || ''}
                            alt={product.name || 'Product'}
                            className="h-16 w-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-foreground font-medium">{product.name || 'Unnamed Product'}</p>
                            {product.description && (
                              <p className="text-muted-foreground text-sm line-clamp-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {weight || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                            {originalPrice && originalPrice > (product.price || 0) && (
                              <span className="text-muted-foreground text-sm line-through">
                                ₹{originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {inStock ? (
                            <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/20">
                              In Stock
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              Out of Stock
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog - Same as Add but with edit handler */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            {/* Same form fields as Add Product */}
            <div>
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-originalPrice">Original Price (₹)</Label>
                <Input
                  id="edit-originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-stock">Stock *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-weight">Fabric/Weight</Label>
                <Input
                  id="edit-weight"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-image">Product Image *</Label>
              
              {/* Image Preview */}
              {formData.image && (
                <div className="mb-3 relative inline-block">
                  <ImageWithFallback
                    src={formData.image}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    onClick={() => setFormData({ ...formData, image: '' })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-3">
                {/* File Upload Option */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Upload Image File
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('edit-image-upload')?.click()}
                      className="flex-1"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max size: 2MB • Formats: JPG, PNG, WebP
                  </p>
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border"></div>
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 border-t border-border"></div>
                </div>

                {/* URL Input Option */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Paste Image URL
                  </Label>
                  <Input
                    id="edit-image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required={!formData.image}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="edit-tags">Tags (comma separated)</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-rating">Rating (1-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-reviews">Number of Reviews</Label>
                <Input
                  id="edit-reviews"
                  type="number"
                  value={formData.reviews}
                  onChange={(e) => setFormData({ ...formData, reviews: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div>
                <Label>In Stock Status</Label>
                <p className="text-muted-foreground text-sm">Show this product as available</p>
              </div>
              <Switch
                checked={formData.inStock}
                onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
              />
            </div>

            {/* Color Variations Section */}
            <div className="border-2 border-primary/30 rounded-lg p-4 space-y-4 bg-primary/5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-lg">Color Variations</Label>
                  <p className="text-muted-foreground text-sm">Add multiple color options for this product</p>
                </div>
                <div className="flex-shrink-0">
                  <Switch
                    checked={formData.hasVariations}
                    onCheckedChange={(checked) => {
                      if (checked && formData.variations.length === 0) {
                        // Add first variation by default
                        setFormData({ 
                          ...formData, 
                          hasVariations: checked,
                          variations: [{
                            id: Date.now().toString(),
                            color: '',
                            stock: 0,
                            priceAdjustment: 0,
                            image: ''
                          }]
                        });
                      } else {
                        setFormData({ ...formData, hasVariations: checked });
                      }
                    }}
                  />
                </div>
              </div>

              {formData.hasVariations && (
                <div className="space-y-3">
                  {formData.variations.map((variation, index) => (
                    <div key={variation.id} className="p-3 bg-background border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Color Variation {index + 1}</Label>
                        {formData.variations.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newVariations = formData.variations.filter((_, i) => i !== index);
                              setFormData({ ...formData, variations: newVariations });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Color Name *</Label>
                          <Input
                            placeholder="e.g., Red, Blue, Golden"
                            value={variation.color}
                            onChange={(e) => {
                              const newVariations = [...formData.variations];
                              newVariations[index].color = e.target.value;
                              setFormData({ ...formData, variations: newVariations });
                            }}
                            required={formData.hasVariations}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Stock *</Label>
                          <Input
                            type="number"
                            placeholder="10"
                            value={variation.stock}
                            onChange={(e) => {
                              const newVariations = [...formData.variations];
                              newVariations[index].stock = Number(e.target.value);
                              setFormData({ ...formData, variations: newVariations });
                            }}
                            required={formData.hasVariations}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Price Adjustment (₹)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={variation.priceAdjustment}
                            onChange={(e) => {
                              const newVariations = [...formData.variations];
                              newVariations[index].priceAdjustment = Number(e.target.value);
                              setFormData({ ...formData, variations: newVariations });
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Extra charge for this color (+/-)
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs">Image (Optional)</Label>
                          
                          {/* Variation Image Preview */}
                          {variation.image && (
                            <div className="mb-2 relative inline-block">
                              <ImageWithFallback
                                src={variation.image}
                                alt={`${variation.color} preview`}
                                className="w-16 h-16 object-cover rounded border border-border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute -top-1 -right-1 h-4 w-4 p-0 rounded-full"
                                onClick={() => {
                                  const newVariations = [...formData.variations];
                                  newVariations[index].image = '';
                                  setFormData({ ...formData, variations: newVariations });
                                }}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleVariationImageUpload(e, index)}
                              className="hidden"
                              id={`edit-variation-image-${index}`}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById(`edit-variation-image-${index}`)?.click()}
                            >
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                            <Input
                              placeholder="or paste URL"
                              className="text-xs"
                              value={variation.image}
                              onChange={(e) => {
                                const newVariations = [...formData.variations];
                                newVariations[index].image = e.target.value;
                                setFormData({ ...formData, variations: newVariations });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        variations: [
                          ...formData.variations,
                          {
                            id: Date.now().toString(),
                            color: '',
                            stock: 0,
                            priceAdjustment: 0,
                            image: ''
                          }
                        ]
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Color
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Update Product</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}