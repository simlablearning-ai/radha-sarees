import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Upload, X, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CategoryImage {
  category: string;
  imageUrl: string;
}

export function ImageManagement() {
  const { categoryImages } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const categories = ["Wedding", "Ethnic", "Casuals", "Festival", "New Arrivals", "Celebrity"];

  const handleAddCategoryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !imageUrl) {
      toast.error("Please fill all fields");
      return;
    }

    const success = await syncedActions.updateCategoryImage(selectedCategory, imageUrl);
    
    if (success) {
      toast.success("Category image updated successfully!");
      setIsAddDialogOpen(false);
      setSelectedCategory("");
      setImageUrl("");
    }
  };

  const handleRemoveCategoryImage = async (category: string) => {
    if (confirm(`Remove image for ${category} category?`)) {
      const success = await syncedActions.updateCategoryImage(category, "");
      if (success) {
        toast.success("Category image removed!");
      }
    }
  };

  const getCategoryImage = (category: string) => {
    return categoryImages.find(ci => ci.category === category)?.imageUrl || "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-2">Image Management</h2>
          <p className="text-muted-foreground">Manage category images and banners</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Category Image</DialogTitle>
              <DialogDescription>
                Add or update an image for a category
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCategoryImage} className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the full URL of the image
                </p>
              </div>

              {imageUrl && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <ImageWithFallback
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {getCategoryImage(selectedCategory) ? "Update" : "Upload"} Image
                </Button>
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

      {/* Category Images Grid */}
      <div>
        <h3 className="text-foreground mb-4">Category Images</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const imageUrl = getCategoryImage(category);
            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-base">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  {imageUrl ? (
                    <div className="space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-border group">
                        <ImageWithFallback
                          src={imageUrl}
                          alt={category}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveCategoryImage(category)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {imageUrl}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm mb-3">No image uploaded</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Image Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground">
            Category images are displayed on the homepage and category pages. Follow these guidelines for best results:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-muted-foreground">
                <span className="text-foreground">Image Size:</span> Recommended minimum size is 800x600 pixels
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-muted-foreground">
                <span className="text-foreground">Aspect Ratio:</span> Use 4:3 or 16:9 for best display
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-muted-foreground">
                <span className="text-foreground">Format:</span> JPG, PNG, or WebP formats are supported
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-muted-foreground">
                <span className="text-foreground">URL:</span> Use direct image URLs (e.g., from Unsplash, Imgur, or your CDN)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <p className="text-muted-foreground">
                <span className="text-foreground">Quality:</span> Use high-quality images that represent your saree categories well
              </p>
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted">
            <p className="text-foreground text-sm mb-1">💡 Pro Tip</p>
            <p className="text-muted-foreground text-xs">
              You can use free stock images from Unsplash.com. Right-click on any image, select "Copy Image Address", and paste the URL here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
