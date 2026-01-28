// URL utility functions for SEO-friendly URLs

/**
 * Convert a string to a URL-friendly slug
 * Examples:
 * - "Festival Sarees" -> "festival-sarees"
 * - "Under Rs.499" -> "under-rs-499"
 * - "Fancy Sarees" -> "fancy-sarees"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '-') // Replace special chars with dash
    .replace(/[\s_]+/g, '-')    // Replace spaces and underscores with dash
    .replace(/-+/g, '-')         // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, '');    // Remove leading/trailing dashes
}

/**
 * Convert slug back to original format for matching
 * This helps in finding the original category name
 */
export function fromSlug(slug: string): string {
  // Common patterns to restore
  const patterns: { [key: string]: string } = {
    'festival': 'Festival',
    'casual': 'Casual',
    'ethnic': 'Ethnic',
    'fancy': 'Fancy',
    'semi-silk-sarees': 'Semi Silk Sarees',
    'cotton-sarees': 'Cotton Sarees',
    'boutique-sarees': 'Boutique Sarees',
    'party-wear-sarees': 'Party wear sarees',
    'under-rs-499': 'Under Rs.499',
  };

  return patterns[slug] || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate product URL slug from product name and ID
 * Example: "Beautiful Red Saree", 123 -> "beautiful-red-saree-123"
 */
export function toProductSlug(name: string, id: number): string {
  const nameSlug = toSlug(name);
  return `${nameSlug}-${id}`;
}

/**
 * Extract product ID from product slug
 * Example: "beautiful-red-saree-123" -> 123
 */
export function extractProductId(slug: string): number | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart, 10);
  return isNaN(id) ? null : id;
}

/**
 * Generate category URL
 * Example: "Festival" -> "/category/festival"
 */
export function toCategoryUrl(categoryName: string): string {
  return `/category/${toSlug(categoryName)}`;
}

/**
 * Generate product URL
 * Example: "Beautiful Red Saree", 123 -> "/product/beautiful-red-saree-123"
 */
export function toProductUrl(productName: string, productId: number): string {
  return `/product/${toProductSlug(productName, productId)}`;
}

/**
 * Check if a slug matches a category name (case-insensitive)
 */
export function slugMatchesCategory(slug: string, categoryName: string): boolean {
  return toSlug(categoryName) === slug.toLowerCase();
}
