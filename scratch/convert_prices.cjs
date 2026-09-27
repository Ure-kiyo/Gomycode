const fs = require('fs')

const path = "c:\\Users\\ADMIN\\Desktop\\Gomycode\\src\\mock\\products.ts"
let content = fs.readFileSync(path, "utf-8")

function replacePrice(match, before, price, after) {
    let dzdPrice = parseFloat(price) * 140
    if (dzdPrice > 5000) {
        dzdPrice = Math.round(dzdPrice / 1000) * 1000
    } else if (dzdPrice > 1000) {
        dzdPrice = Math.round(dzdPrice / 100) * 100
    } else {
        dzdPrice = Math.round(dzdPrice)
    }
    return `${before}${dzdPrice}${after}`
}

content = content.replace(/(category:\s*['"].*?['"],\s*)(\d+\.?\d*)(,\s*['"](?:bestbuy|newegg|amazon|target|rei|bhphoto|walmart|nike|sephora|wholefoods|ikea)['"])/g, replacePrice)
content = content.replace(/(listPrice:\s*)(\d+\.?\d*)/g, replacePrice)

fs.writeFileSync(path, content, "utf-8")
