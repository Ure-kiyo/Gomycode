import re

with open(r"c:\Users\ADMIN\Desktop\Gomycode\src\mock\products.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace prices with DZD and add imageUrl
def replace_price(match):
    before = match.group(1)
    price = float(match.group(2))
    after = match.group(3)
    
    # 135x conversion, round to nearest 1000 or so if > 10,000, etc.
    dzd_price = price * 140
    if dzd_price > 5000:
        dzd_price = round(dzd_price / 1000) * 1000
    elif dzd_price > 1000:
        dzd_price = round(dzd_price / 100) * 100
    else:
        dzd_price = round(dzd_price)
        
    return f"{before}{dzd_price}{after}"

content = re.sub(r"(category:\s*['\"].*?['\"],\s*)(\d+\.?\d*)(,\s*['\"](?:bestbuy|newegg|amazon|target|rei|bhphoto|walmart|nike|sephora|wholefoods|ikea)['\"])", replace_price, content)
content = re.sub(r"(listPrice:\s*)(\d+\.?\d*)", replace_price, content)

# Now inject imageUrl in the options object. We will just use `imageUrl: 'https://picsum.photos/seed/' + id + '/400/400'`
# Wait, ID is dynamically assigned in `toProduct`. So we should just add it there!
# Let's change `toProduct` in `products.ts`.
with open("c:\\Users\\ADMIN\\Desktop\\Gomycode\\src\\mock\\products.ts", "w", encoding="utf-8") as f:
    f.write(content)
