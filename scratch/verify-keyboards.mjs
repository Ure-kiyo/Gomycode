import { searchProducts } from '../src/mock/searchEngine.ts';
import { resolveQuery } from '../src/mock/queryResolver.ts';
import { PRODUCTS } from '../src/mock/products.ts';

function checkQuery(q) {
  const resolved = resolveQuery({ query: q });
  const result = searchProducts(resolved, PRODUCTS);
  
  console.log(`\nQuery: "${q}"`);
  console.log(`Matched ${result.matchedProducts.length} products (Confidence: ${result.confidence})`);
  
  result.matchedProducts.slice(0, 5).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.title} [${p.category}] - ${p.price} DZD`);
    console.log(`     Image: ${p.imageUrl}`);
    console.log(`     Ref:   ${p.referenceUrl}`);
  });
}

console.log('--- KEYBOARD SEARCH VERIFICATION ---');
checkQuery('keyboard');
checkQuery('clavier');
