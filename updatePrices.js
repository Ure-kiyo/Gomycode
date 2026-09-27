const fs = require('fs');

const productsPath = './src/mock/products.ts';
let productsContent = fs.readFileSync(productsPath, 'utf8');

// Find all lines that are seeds
productsContent = productsContent.replace(/^(\s+\[\s*'.*?',\s*'.*?',\s*'.*?',\s*)(\d+)(.*\]\s*,?)$/gm, (match, pre, price, post) => {
    let newPrice = Math.round(parseInt(price, 10) * 1.6 / 500) * 500;
    
    // Check if post contains listPrice
    let newPost = post.replace(/listPrice:\s*(\d+)/g, (m, lp) => {
        let newLp = Math.round(parseInt(lp, 10) * 1.6 / 500) * 500;
        return 'listPrice: ' + newLp;
    });
    
    return pre + newPrice + newPost;
});

fs.writeFileSync(productsPath, productsContent);
console.log('Done!');
