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
import { Plus, Edit, Trash2, Search, Package, Upload, Download, Filter, FileSpreadsheet, X } from "lucide-react";
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
}

export function ProductManagement() {
  const { products } = useStore();
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
  });

  const categories = ["Wedding", "Ethnic", "Casuals", "Festival", "New Arrivals", "Celebrity"];

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
      for (const id of selectedProducts) {
        await syncedActions.deleteProduct(id);
      }
      toast.success(`${selectedProducts.length} products deleted!`);
      setSelectedProducts([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target?.result as string;
        setBulkCSV(csvContent);
        processCSV(csvContent);
      };
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target?.result as string;
        setBulkCSV(csvContent);
        processCSV(csvContent);
      };
      reader.readAsText(file);
    }
  };

  const processCSV = async (csvContent: string) => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        toast.error("CSV must have header and at least one product");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const products = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const product: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          
          if (header === 'price' || header === 'originalprice' || header === 'stock' || header === 'rating' || header === 'reviews') {
            product[header] = Number(value) || 0;
          } else if (header === 'instock') {
            product[header] = value.toLowerCase() === 'true' || value === '1';
          } else if (header === 'tags') {
            product[header] = value ? value.split(';').map(t => t.trim()) : [];
          } else {
            product[header] = value || '';
          }
        });

        if (product.name && product.category) {
          products.push(product);
        }
      }

      for (const product of products) {
        await syncedActions.addProduct(product);
      }

      toast.success(`${products.length} products uploaded successfully!`);
      setIsBulkUploadOpen(false);
      setBulkCSV("");
    } catch (error) {
      toast.error("Error parsing CSV. Please check format.");
    }
  };

  const handleBulkEdit = async () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }

    for (const id of selectedProducts) {
      const product = products.find(p => p.id === id);
      if (!product) continue;

      const updates: any = {};

      if (bulkEditData.category) {
        updates.category = bulkEditData.category;
      }

      if (bulkEditData.priceAdjustment !== 0) {
        if (bulkEditData.adjustmentType === 'percentage') {
          updates.price = product.price * (1 + bulkEditData.priceAdjustment / 100);
          if ((product as any).originalPrice) {
            updates.originalPrice = (product as any).originalPrice * (1 + bulkEditData.priceAdjustment / 100);
          }
        } else {
          updates.price = product.price + bulkEditData.priceAdjustment;
          if ((product as any).originalPrice) {
            updates.originalPrice = (product as any).originalPrice + bulkEditData.priceAdjustment;
          }
        }
      }

      if (bulkEditData.tags) {
        const newTags = bulkEditData.tags.split(',').map(t => t.trim()).filter(t => t);
        updates.tags = [...(product.tags || []), ...newTags];
      }

      if (Object.keys(updates).length > 0) {
        await syncedActions.updateProduct(id, updates);
      }
    }

    toast.success(`${selectedProducts.length} products updated!`);
    setIsBulkEditOpen(false);
    setSelectedProducts([]);
    setBulkEditData({
      category: "",
      priceAdjustment: 0,
      adjustmentType: "percentage",
      tags: "",
    });
  };

  const handleExportCSV = () => {
    const headers = ["name", "category", "price", "originalPrice", "stock", "weight", "image", "description", "tags", "rating", "reviews", "inStock"];
    const rows = filteredProducts.map(p => [
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
    ]);

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
    const sampleCSV = `name,category,price,originalPrice,stock,weight,image,description,tags,rating,reviews,inStock
"Royal Silk Saree","Wedding",15999,19999,10,"Pure Silk","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400","Beautiful silk saree perfect for weddings","featured;new;bestseller",5,128,true
"Designer Saree","Ethnic",12999,16999,15,"Georgette","https://images.unsplash.com/photo-1583391733981-0b46bbf14a37?w=400","Elegant designer saree for special occasions","featured;designer",4.5,95,true
"Cotton Saree","Casuals",5999,7999,20,"Cotton","https://images.unsplash.com/photo-1624206112918-f140f087f9db?w=400","Comfortable cotton saree for daily wear","new;casual",4.8,210,true`;

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
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
                      name,category,price,originalPrice,stock,weight,image,description,tags,rating,reviews,inStock
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    • Tags should be separated by semicolons (;)
                    <br />
                    • inStock should be "true" or "false"
                    <br />
                    • All text values should be in quotes
                  </p>
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
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    required
                  />
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
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-foreground">{product.name}</p>
                            {product.description && (
                              <p className="text-muted-foreground text-sm line-clamp-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {weight || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-foreground">₹{product.price.toLocaleString('en-IN')}</span>
                            {originalPrice && originalPrice > product.price && (
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
              <Label htmlFor="edit-image">Image URL *</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                required
              />
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
