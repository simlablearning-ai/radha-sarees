import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
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
import { Plus, Edit, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProductFormData {
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
  tags: string;
}

export function ProductManagement() {
  const { products } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    category: "Wedding",
    description: "",
    image: "",
    stock: 0,
    tags: "",
  });

  const categories = ["Wedding", "Ethnic", "Casuals", "Festival", "New Arrivals", "Celebrity"];

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    const success = await syncedActions.addProduct({
      name: formData.name,
      price: formData.price,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      stock: formData.stock,
      tags: tagsArray,
    });

    if (success) {
      toast.success("Product added successfully!");
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        price: 0,
        category: "Wedding",
        description: "",
        image: "",
        stock: 0,
        tags: "",
      });
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProduct) return;
    
    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
    
    const success = await syncedActions.updateProduct(editingProduct.id, {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      description: formData.description,
      image: formData.image,
      stock: formData.stock,
      tags: tagsArray,
    });

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

  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || "",
      image: product.image,
      stock: product.stock || 0,
      tags: product.tags ? product.tags.join(", ") : "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-2">Product Management</h2>
          <p className="text-muted-foreground">Manage your saree collection</p>
        </div>
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
                <Label htmlFor="name">Product Name</Label>
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
                  <Label htmlFor="price">Price (₹)</Label>
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
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
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
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
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

      {/* Search */}
      <div className="flex items-center gap-4">
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
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {filteredProducts.length} products
          </span>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="text-foreground">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-foreground">₹{product.price.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-foreground">{product.stock || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {product.tags?.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="edit-image">Image URL</Label>
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
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
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
