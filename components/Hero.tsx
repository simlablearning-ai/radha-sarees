import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useStore } from "../lib/store";
import { motion } from "motion/react";

export function Hero() {
  const { siteSettings } = useStore();
  const animationType = siteSettings.heroAnimation;
  const backgroundOpacity = siteSettings.heroBackgroundOpacity || 0.5;
  const overlayOpacity = siteSettings.heroOverlayOpacity || 0.3;
  const overlayColor = siteSettings.heroOverlayColor || '#000000';
  const customBackgroundImage = siteSettings.customBackgroundImage;
  const showCategories = siteSettings.heroShowCategories ?? true; // Default to true if not set

  // Get hero images from settings or use defaults
  const heroImages = siteSettings.heroImages || [
    { title: "Bridal Collection", url: "https://images.unsplash.com/photo-1726981448126-c7fc9237cdb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwc2FyZWUlMjBzaWxrfGVufDF8fHx8MTc2MzM2NDU5Mnww&ixlib=rb-4.1.0&q=80&w=1080" },
    { title: "Pure Silk", url: "https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhuaWMlMjBzaWxrJTIwc2FyZWV8ZW58MXx8fHwxNzYzMzY0NTkyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
    { title: "Designer Wear", url: "https://images.unsplash.com/photo-1756483509177-bbabd67a3234?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ25lciUyMHNhcmVlJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjMzNjQ1OTN8MA&ixlib=rb-4.1.0&q=80&w=1080" },
    { title: "Festival Special", url: "https://images.unsplash.com/photo-1761125056724-fb6485468a9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXN0aXZhbCUyMHNhcmVlJTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzYzMzY0NTkzfDA&ixlib=rb-4.1.0&q=80&w=1080" }
  ];

  // Animation variants for different types
  const getAnimationVariants = (index: number) => {
    switch (animationType) {
      case 'float':
        return {
          initial: { y: 0 },
          animate: {
            y: [0, -20, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }
          }
        };
      
      case 'rotate':
        return {
          initial: { rotate: 0 },
          animate: { rotate: 0 },
          whileHover: {
            rotate: [0, -5, 5, -5, 0],
            transition: { duration: 0.5 }
          }
        };
      
      case 'scale':
        return {
          initial: { scale: 1 },
          animate: { scale: 1 },
          whileHover: {
            scale: 1.05,
            transition: { duration: 0.3 }
          }
        };
      
      case 'slide':
        const directions = [
          { x: -100, y: -100 },
          { x: 100, y: -100 },
          { x: -100, y: 100 },
          { x: 100, y: 100 }
        ];
        return {
          initial: { 
            opacity: 0,
            x: directions[index].x,
            y: directions[index].y
          },
          animate: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
              duration: 0.8,
              delay: index * 0.15,
              ease: "easeOut"
            }
          }
        };
      
      default:
        return {
          initial: {},
          animate: {}
        };
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/10 overflow-hidden">
      {/* Background Pattern */}
      {customBackgroundImage && (
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${customBackgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundOpacity
          }}
        />
      )}
      
      {/* Background Overlay */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity,
        }}
      />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className={`grid grid-cols-1 ${showCategories ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
          {/* Left Panel - Tagline */}
          <div className={showCategories ? 'text-left' : 'text-center'}>
            <h1 
              className="text-white drop-shadow-lg"
              style={{
                fontFamily: 'var(--font-family-script)',
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: '1.2',
                fontWeight: '400'
              }}
            >
              Exquisite Designer Sarees
              <br />
              For Every Occasion
            </h1>
          </div>
          
          {/* Right Panel - 4 Box Images (Conditional) */}
          {showCategories && (
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <motion.div
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderRadius: 'var(--radius)' }}
                    {...getAnimationVariants(0)}
                  >
                    <ImageWithFallback
                      src={heroImages[0].url}
                      alt="Wedding Saree"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-foreground">{heroImages[0].title}</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderRadius: 'var(--radius)' }}
                    {...getAnimationVariants(1)}
                  >
                    <ImageWithFallback
                      src={heroImages[1].url}
                      alt="Silk Saree"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-foreground">{heroImages[1].title}</p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="space-y-4 mt-8">
                  <motion.div
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderRadius: 'var(--radius)' }}
                    {...getAnimationVariants(2)}
                  >
                    <ImageWithFallback
                      src={heroImages[2].url}
                      alt="Designer Saree"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-foreground">{heroImages[2].title}</p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    className="bg-card rounded-lg overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderRadius: 'var(--radius)' }}
                    {...getAnimationVariants(3)}
                  >
                    <ImageWithFallback
                      src={heroImages[3].url}
                      alt="Festival Saree"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-foreground">{heroImages[3].title}</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}