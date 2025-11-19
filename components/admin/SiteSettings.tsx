import { useState } from "react";
import { useStore } from "../../lib/store";
import { syncedActions } from "../../lib/useData";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Sparkles, Palette, Save, RotateCcw, Layout } from "lucide-react";
import { toast } from "sonner";

export function SiteSettings() {
  const { siteSettings } = useStore();
  
  // Hero Animation
  const [heroAnimation, setHeroAnimation] = useState(siteSettings.heroAnimation || 'float');
  
  // Background Opacity
  const [heroBackgroundOpacity, setHeroBackgroundOpacity] = useState(
    (siteSettings.heroBackgroundOpacity ?? 0.5) * 100
  );
  
  // Overlay Settings
  const [heroOverlayOpacity, setHeroOverlayOpacity] = useState(
    (siteSettings.heroOverlayOpacity ?? 0.3) * 100
  );
  const [heroOverlayColor, setHeroOverlayColor] = useState(
    siteSettings.heroOverlayColor || '#000000'
  );
  
  // Hero Category Display
  const [heroShowCategories, setHeroShowCategories] = useState(
    siteSettings.heroShowCategories ?? true
  );

  const animations = [
    { value: 'float', label: 'Float', description: 'Gentle floating motion' },
    { value: 'rotate', label: 'Rotate', description: 'Smooth rotation effect' },
    { value: 'scale', label: 'Scale', description: 'Subtle scaling animation' },
    { value: 'slide', label: 'Slide', description: 'Sliding transition' },
  ];

  const handleSave = async () => {
    const success = await syncedActions.updateSiteSettings({
      heroAnimation,
      heroBackgroundOpacity: heroBackgroundOpacity / 100,
      heroOverlayOpacity: heroOverlayOpacity / 100,
      heroOverlayColor,
      heroShowCategories,
    });

    if (success) {
      toast.success("Site settings saved successfully!");
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all settings to defaults?")) return;

    setHeroAnimation('float');
    setHeroBackgroundOpacity(50);
    setHeroOverlayOpacity(30);
    setHeroOverlayColor('#000000');
    setHeroShowCategories(true);

    const success = await syncedActions.updateSiteSettings({
      heroAnimation: 'float',
      heroBackgroundOpacity: 0.5,
      heroOverlayOpacity: 0.3,
      heroOverlayColor: '#000000',
      heroShowCategories: true,
    });

    if (success) {
      toast.success("Settings reset to defaults!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-foreground mb-2">Site Settings</h2>
          <p className="text-muted-foreground">
            Customize your homepage hero section appearance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Hero Animation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Hero Animation
          </CardTitle>
          <CardDescription>
            Choose the animation effect for the hero section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {animations.map((anim) => (
              <button
                key={anim.value}
                onClick={() => setHeroAnimation(anim.value as any)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  heroAnimation === anim.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-foreground mb-1">{anim.label}</div>
                <div className="text-sm text-muted-foreground">{anim.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Background Opacity */}
      <Card>
        <CardHeader>
          <CardTitle>Background Image Opacity</CardTitle>
          <CardDescription>
            Adjust the opacity of the hero background image (0% = transparent, 100% = fully visible)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Opacity</Label>
              <span className="text-sm text-muted-foreground">{heroBackgroundOpacity}%</span>
            </div>
            <Slider
              value={[heroBackgroundOpacity]}
              onValueChange={(value) => setHeroBackgroundOpacity(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Visual Preview */}
          <div className="relative h-32 rounded-lg overflow-hidden border border-border">
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary to-pink-600"
              style={{ opacity: heroBackgroundOpacity / 100 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm px-3 py-1 rounded bg-black/50">
                Preview
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overlay Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Overlay Settings
          </CardTitle>
          <CardDescription>
            Add a colored overlay on top of the hero background to improve text readability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overlay Color */}
          <div className="space-y-3">
            <Label htmlFor="overlay-color">Overlay Color</Label>
            <div className="flex gap-3">
              <div className="relative">
                <input
                  id="overlay-color"
                  type="color"
                  value={heroOverlayColor}
                  onChange={(e) => setHeroOverlayColor(e.target.value)}
                  className="h-10 w-20 rounded border border-input cursor-pointer"
                />
              </div>
              <Input
                value={heroOverlayColor}
                onChange={(e) => setHeroOverlayColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Common choices: #000000 (Black), #FFFFFF (White), #75074f (Brand Color)
            </p>
          </div>

          {/* Overlay Opacity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Overlay Opacity</Label>
              <span className="text-sm text-muted-foreground">{heroOverlayOpacity}%</span>
            </div>
            <Slider
              value={[heroOverlayOpacity]}
              onValueChange={(value) => setHeroOverlayOpacity(value[0])}
              max={100}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher opacity = stronger overlay effect. Recommended: 20-40% for best readability.
            </p>
          </div>

          {/* Overlay Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="relative h-48 rounded-lg overflow-hidden border border-border">
              {/* Background Layer */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-primary via-pink-600 to-purple-600"
                style={{ opacity: heroBackgroundOpacity / 100 }}
              />
              
              {/* Overlay Layer */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: heroOverlayColor,
                  opacity: heroOverlayOpacity / 100,
                }}
              />
              
              {/* Content Layer */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-6">
                <h3 className="text-2xl mb-2">Hero Title</h3>
                <p className="text-sm opacity-90">This is how your hero text will look</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The overlay sits between the background and text, making text easier to read
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Presets</CardTitle>
          <CardDescription>
            Apply popular overlay combinations with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Preset 1: Dark Overlay */}
            <button
              onClick={() => {
                setHeroOverlayColor('#000000');
                setHeroOverlayOpacity(40);
              }}
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors text-left group"
            >
              <div className="relative h-20 rounded mb-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-600" />
                <div className="absolute inset-0 bg-black opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs">Dark Overlay</span>
                </div>
              </div>
              <div className="text-foreground group-hover:text-primary transition-colors">
                Dark Overlay
              </div>
              <div className="text-xs text-muted-foreground">
                Black 40% - Classic & Elegant
              </div>
            </button>

            {/* Preset 2: Subtle Dark */}
            <button
              onClick={() => {
                setHeroOverlayColor('#000000');
                setHeroOverlayOpacity(20);
              }}
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors text-left group"
            >
              <div className="relative h-20 rounded mb-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-600" />
                <div className="absolute inset-0 bg-black opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs">Subtle Dark</span>
                </div>
              </div>
              <div className="text-foreground group-hover:text-primary transition-colors">
                Subtle Dark
              </div>
              <div className="text-xs text-muted-foreground">
                Black 20% - Light Touch
              </div>
            </button>

            {/* Preset 3: Brand Tint */}
            <button
              onClick={() => {
                setHeroOverlayColor('#75074f');
                setHeroOverlayOpacity(30);
              }}
              className="p-4 rounded-lg border border-border hover:border-primary transition-colors text-left group"
            >
              <div className="relative h-20 rounded mb-3 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-pink-600" />
                <div className="absolute inset-0 bg-[#75074f] opacity-30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs">Brand Tint</span>
                </div>
              </div>
              <div className="text-foreground group-hover:text-primary transition-colors">
                Brand Tint
              </div>
              <div className="text-xs text-muted-foreground">
                Burgundy 30% - On Brand
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Hero Category Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            Hero Layout
          </CardTitle>
          <CardDescription>
            Control the display of category boxes on the right side of the hero section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex-1">
              <Label className="text-foreground mb-1">Show Category Boxes</Label>
              <p className="text-sm text-muted-foreground">
                Display 4 category image boxes on the right side of the hero section. When disabled, the hero title will be centered.
              </p>
            </div>
            <Switch
              checked={heroShowCategories}
              onCheckedChange={(checked) => setHeroShowCategories(checked)}
              className="ml-4"
            />
          </div>
          
          {/* Preview */}
          <div className="space-y-2">
            <Label>Layout Preview</Label>
            <div className="relative h-40 rounded-lg overflow-hidden border border-border bg-gradient-to-br from-primary/5 via-background to-secondary/10">
              <div className="absolute inset-0 p-6">
                <div className={`grid grid-cols-1 ${heroShowCategories ? 'md:grid-cols-2' : ''} gap-4 h-full items-center`}>
                  {/* Title */}
                  <div className={heroShowCategories ? 'text-left' : 'text-center col-span-1'}>
                    <div className="h-6 w-48 bg-foreground/20 rounded mb-2 mx-auto" style={{ marginLeft: heroShowCategories ? '0' : 'auto', marginRight: heroShowCategories ? 'initial' : 'auto' }}></div>
                    <div className="h-6 w-32 bg-foreground/20 rounded mx-auto" style={{ marginLeft: heroShowCategories ? '0' : 'auto', marginRight: heroShowCategories ? 'initial' : 'auto' }}></div>
                  </div>
                  
                  {/* Category Boxes */}
                  {heroShowCategories && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 bg-card border border-border rounded"></div>
                      <div className="h-12 bg-card border border-border rounded"></div>
                      <div className="h-12 bg-card border border-border rounded"></div>
                      <div className="h-12 bg-card border border-border rounded"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {heroShowCategories 
                ? 'Categories are shown on the right with left-aligned title' 
                : 'Title is centered with full width'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button at Bottom */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
}