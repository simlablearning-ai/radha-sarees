interface NavigationProps {
  onCategorySelect: (categoryName: string) => void;
  selectedCategory: string | null;
  onCategoryPageSelect?: (categoryName: string) => void;
}

export function Navigation({ onCategorySelect, selectedCategory, onCategoryPageSelect }: NavigationProps) {
  const categories = [
    "Festival",
    "Casual",
    "Ethnic",
    "Fancy"
  ];

  const handleCategoryClick = (category: string) => {
    if (onCategoryPageSelect) {
      onCategoryPageSelect(category);
    } else {
      onCategorySelect(category);
    }
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-8 h-14 overflow-x-auto">
          <button
            onClick={() => onCategorySelect("")}
            className={`whitespace-nowrap transition-colors ${
              !selectedCategory
                ? "text-primary border-b-2 border-primary"
                : "text-foreground hover:text-primary"
            }`}
          >
            All Sarees
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}