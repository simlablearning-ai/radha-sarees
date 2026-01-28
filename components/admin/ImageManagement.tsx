import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Upload, X, Image as ImageIcon, Trash2, Plus, Save } from "lucide-react";
import { toast } from "sonner";

export function ImageManagement() {
  const { siteSettings } = useStore();
  const [activeTab, setActiveTab] = useState("hero");
  
  // Hero Images
  const [isAddHeroOpen, setIsAddHeroOpen] = useState(false);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroUrl, setHeroUrl] = useState("");
  
  // Category Images
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  
  // Background Image
  const [customBgUrl, setCustomBgUrl] = useState(siteSettings.customBackgroundImage || "");

  const categories = ["Festival", "Casual", "Ethnic", "Fancy", "Under Rs.499"];

  // Hero Image Functions
  const handleAddHeroImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!heroTitle || !heroUrl) {
      toast.error("Please fill all fields");
      return;
    }

    const currentHeroImages = siteSettings.heroImages || [];
    const updatedHeroImages = [...currentHeroImages, { title: heroTitle, url: heroUrl }];

    const success = await syncedActions.updateSiteSettings({
      heroImages: updatedHeroImages
    });
    
    if (success) {
      toast.success("Hero image added successfully!");
      setIsAddHeroOpen(false);
      setHeroTitle("");
      setHeroUrl("");
    }
  };

  const handleRemoveHeroImage = async (index: number) => {
    if (confirm("Remove this hero image?")) {
      const currentHeroImages = siteSettings.heroImages || [];
      const updatedHeroImages = currentHeroImages.filter((_, i) => i !== index);
      
      const success = await syncedActions.updateSiteSettings({
        heroImages: updatedHeroImages
      });
      
      if (success) {
        toast.success("Hero image removed!");
      }
    }
  };

  // Category Image Functions
  const handleAddCategoryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory || !categoryImageUrl) {
      toast.error("Please fill all fields");
      return;
    }

    const currentImages = siteSettings.categoryImages || [];
    const existingIndex = currentImages.findIndex(img => img.name === selectedCategory);
    
    let updatedImages;
    if (existingIndex >= 0) {
      updatedImages = [...currentImages];
      updatedImages[existingIndex] = { name: selectedCategory, url: categoryImageUrl };
    } else {
      updatedImages = [...currentImages, { name: selectedCategory, url: categoryImageUrl }];
    }

    const success = await syncedActions.updateSiteSettings({
      categoryImages: updatedImages
    });
    
    if (success) {
      toast.success("Category image updated successfully!");
      setIsAddCategoryOpen(false);
      setSelectedCategory("");
      setCategoryImageUrl("");
    }
  };

  const handleRemoveCategoryImage = async (category: string) => {
    if (confirm(`Remove image for ${category} category?`)) {
      const currentImages = siteSettings.categoryImages || [];
      const updatedImages = currentImages.filter(img => img.name !== category);
      
      const success = await syncedActions.updateSiteSettings({
        categoryImages: updatedImages
      });
      
      if (success) {
        toast.success("Category image removed!");
      }
    }
  };

  const getCategoryImage = (category: string) => {
    const categoryImages = siteSettings.categoryImages || [];
    return categoryImages.find(img => img.name === category)?.url || "";
  };

  // Background Image Functions
  const handleSaveBackgroundImage = async () => {
    const success = await syncedActions.updateSiteSettings({
      customBackgroundImage: customBgUrl
    });
    
    if (success) {
      toast.success("Background image updated successfully!");
    }
  };

  const handleClearBackgroundImage = async () => {
    if (confirm("Clear custom background image?")) {
      setCustomBgUrl("");
      const success = await syncedActions.updateSiteSettings({
        customBackgroundImage: ""
      });
      
      if (success) {
        toast.success("Background image cleared!");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground mb-2">Image Management</h2>
        <p className="text-muted-foreground">Manage hero banners, category images, and site backgrounds</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hero">Hero Images</TabsTrigger>
          <TabsTrigger value="category">Category Images</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
        </TabsList>

        {/* HERO IMAGES TAB */}
        <TabsContent value="hero" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground mb-1">Hero Banner Images</h3>
              <p className="text-muted-foreground text-sm">
                Manage carousel images for the homepage hero section
              </p>
            </div>
            <Dialog open={isAddHeroOpen} onOpenChange={setIsAddHeroOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hero Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Hero Image</DialogTitle>
                  <DialogDescription>
                    Add a new image to the hero carousel
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddHeroImage} className="space-y-4">
                  <div>
                    <Label htmlFor="hero-title">Title</Label>
                    <Input
                      id="hero-title"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder="e.g., New Collection"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="hero-url">Image URL</Label>
                    <Input
                      id="hero-url"
                      value={heroUrl}
                      onChange={(e) => setHeroUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      required
                    />
                  </div>

                  {heroUrl && (
                    <div>
                      <Label>Preview</Label>
                      <div className="mt-2 rounded-lg overflow-hidden border border-border">
                        <ImageWithFallback
                          src={heroUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      Add Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddHeroOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Hero Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(siteSettings.heroImages || []).length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No hero images added yet</p>
                  <Button onClick={() => setIsAddHeroOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Hero Image
                  </Button>
                </CardContent>
              </Card>
            ) : (
              (siteSettings.heroImages || []).map((heroImage, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{heroImage.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative rounded-lg overflow-hidden border border-border group">
                      <ImageWithFallback
                        src={heroImage.url}
                        alt={heroImage.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveHeroImage(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {heroImage.url}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Hero Images Info */}
          <Card>
            <CardHeader>
              <CardTitle>About Hero Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Hero images are displayed in a carousel on the homepage. They're the first thing visitors see!
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Recommended Size:</span> 1920x800 pixels (minimum)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Aspect Ratio:</span> 16:9 or 21:9 for best results
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Multiple Images:</span> Add 3-5 images for an engaging carousel
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Title:</span> Use descriptive titles like "New Collection" or "Festive Special"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CATEGORY IMAGES TAB */}
        <TabsContent value="category" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-foreground mb-1">Category Images</h3>
              <p className="text-muted-foreground text-sm">
                Set images for each product category
              </p>
            </div>
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Category Image
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
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-foreground"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="categoryImageUrl">Image URL</Label>
                    <Input
                      id="categoryImageUrl"
                      value={categoryImageUrl}
                      onChange={(e) => setCategoryImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      required
                    />
                  </div>

                  {categoryImageUrl && (
                    <div>
                      <Label>Preview</Label>
                      <div className="mt-2 rounded-lg overflow-hidden border border-border">
                        <ImageWithFallback
                          src={categoryImageUrl}
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
                      onClick={() => setIsAddCategoryOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Images Grid */}
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
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCategory(category);
                                setCategoryImageUrl(imageUrl);
                                setIsAddCategoryOpen(true);
                              }}
                              className="bg-background"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Update
                            </Button>
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
                            setIsAddCategoryOpen(true);
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

          {/* Category Images Info */}
          <Card>
            <CardHeader>
              <CardTitle>Category Image Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Category images are displayed on the homepage and category pages. They help customers quickly identify different saree types.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Image Size:</span> Recommended minimum 800x600 pixels
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Aspect Ratio:</span> Use 4:3 or 16:9 for consistent display
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Content:</span> Feature representative sarees from each category
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Quality:</span> Use high-quality images with good lighting
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BACKGROUND IMAGE TAB */}
        <TabsContent value="background" className="space-y-6">
          <div>
            <h3 className="text-foreground mb-1">Custom Background Image</h3>
            <p className="text-muted-foreground text-sm">
              Set a custom background image for your site
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Background Image Settings</CardTitle>
              <CardDescription>
                Upload a custom background image or pattern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bg-url">Background Image URL</Label>
                <Input
                  id="bg-url"
                  value={customBgUrl}
                  onChange={(e) => setCustomBgUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to use default background
                </p>
              </div>

              {customBgUrl && (
                <div>
                  <Label>Preview</Label>
                  <div className="mt-2 rounded-lg overflow-hidden border border-border">
                    <ImageWithFallback
                      src={customBgUrl}
                      alt="Background Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSaveBackgroundImage} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Background
                </Button>
                {customBgUrl && (
                  <Button variant="outline" onClick={handleClearBackgroundImage}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Background Pattern Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Pattern Suggestions</CardTitle>
              <CardDescription>
                Click any pattern to use it as your background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Subtle Pattern", url: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&q=80" },
                  { name: "Fabric Texture", url: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=400&q=80" },
                  { name: "Minimal Dots", url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80" },
                  { name: "Light Texture", url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80" },
                ].map((pattern) => (
                  <button
                    key={pattern.name}
                    onClick={() => setCustomBgUrl(pattern.url)}
                    className="group relative rounded-lg overflow-hidden border-2 border-border hover:border-primary transition-colors"
                  >
                    <ImageWithFallback
                      src={pattern.url}
                      alt={pattern.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm">{pattern.name}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 <span className="text-foreground">Tip:</span> Subtle patterns work best. Avoid busy images that might distract from your products.
              </p>
            </CardContent>
          </Card>

          {/* Background Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Background Image Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                A good background image enhances your site without overwhelming the content.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Subtlety:</span> Use subtle patterns or textures, not bold images
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Opacity:</span> Consider using semi-transparent backgrounds
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Repeatability:</span> Use seamless patterns that tile well
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <p className="text-muted-foreground">
                    <span className="text-foreground">Performance:</span> Optimize images to keep file sizes under 200KB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
