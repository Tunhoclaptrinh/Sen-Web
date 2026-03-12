/**
 * SEO Linker Utility
 * Automatically finds heritage and artifact names in text and wraps them in internal links.
 */

interface LinkableItem {
  id: number | string;
  name: string;
  type: 'heritage' | 'artifact';
}

/**
 * Injects contextual links into an HTML string based on a dictionary of items.
 */
export const injectContextualLinks = (
  htmlContent: string,
  items: LinkableItem[],
  currentId?: number | string
): string => {
  if (!htmlContent || !items || items.length === 0) return htmlContent;

  let enhancedContent = htmlContent;

  // Sort items by name length descending to avoid partial matches
  // Add safety check for name property
  const sortedItems = [...items]
    .filter(item => item && item.name)
    .sort((a, b) => (b.name?.length || 0) - (a.name?.length || 0));

  sortedItems.forEach(item => {
    // Don't link to the current page itself
    if (currentId && String(item.id) === String(currentId)) return;

    const path = item.type === 'heritage' ? `/heritage-sites/${item.id}` : `/artifacts/${item.id}`;
    
    // Create a regex that finds the name but ensures it's not already inside an <a> tag
    // This is a simplified approach. A perfect one would parse DOM, but this is usually safe for structured content.
    // Matches the name if it's not preceded by > (end of tag) and followed by < (start of tag) in a way that suggests it's already a link.
    // Actually, a simpler regex for standard text replacement:
    const regex = new RegExp(`(?<!<a[^>]*?>)${item.name}(?![^<]*?</a>)`, 'gi');
    
    // We only replace the first few occurrences to avoid over-linking (SEO best practice)
    let occurrences = 0;
    enhancedContent = enhancedContent.replace(regex, (match) => {
      if (occurrences < 2) {
        occurrences++;
        return `<a href="${path}" class="contextual-seo-link" title="Xem chi tiết ${item.name}">${match}</a>`;
      }
      return match;
    });
  });

  return enhancedContent;
};
