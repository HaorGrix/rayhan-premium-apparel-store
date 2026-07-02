import os
import sys
import random
import uuid
from decimal import Decimal
from datetime import datetime, timedelta, timezone

# Add backend directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from backend.app.core.database import Base, engine, SessionLocal
from backend.app.core.security import hash_password
from backend.app.models import User, UserAddress, Category, Brand, Collection, Product, ProductVariant, ProductImage, Coupon, Review, AuditLog
from backend.app.models.product import Campaign, ProductCustomerImage
from backend.app.models.order import Cart, CartItem, Order, OrderItem, Payment, Shipment

UNSPLASH_IDS = {
    "men": [
        "1505022610485-0249ba5b3675", "1507679799987-c73779587ccf",
        "1516257984-b1b4d707412e", "1520975954732-35dd22299614",
        "1534030756781-a477b8cfd66b", "1550246140-5119ae4790b8",
        "1617137968427-85924c800a22", "1617137984095-74e4e5e3613f",
        "1618886614638-80e3c103d31a", "1489980508314-941910ded1f4"
    ],
    "women": [
        "1490481651871-ab68de25d43d", "1515886657613-9f3515b0c78f",
        "1525507119028-ed4c629a60a3", "1539109136881-3be0616acf4b",
        "1581044777550-4cfa60707c03", "1594633312681-425c7b97ccd1",
        "1609505848912-b7c3b8b4beda", "1618244972963-dbee1a7edc95",
        "1609357605129-26f69add5d6e", "1494790108377-be9c29b29330"
    ],
    "shoes": [
        "1542291026-7eec264c27ff", "1549298916-b41d501d3772",
        "1595950653106-6c9ebd614d3a", "1608256246200-53e635b5b65f",
        "1638247025967-b4e38f787b76", "1606107557195-0e29a4b5b4aa",
        "1534653274761-41aae9799b40", "1520639888713-7851133b1ed0"
    ],
    "accessories": [
        "1523275335684-37898b6baf30", "1584917865442-de89df76afd3",
        "1509319117193-57bab727e09d", "1611085583191-a3b1a1e109f1",
        "1614162692292-7ac56d7f7f1e", "1508296695146-257a814070b4",
        "1535632066927-ab7c9ab60908", "1618453292459-7a0ce733a18a"
    ]
}

BRANDS_DATA = [
    {"name": "COS", "slug": "cos", "description": "Minimalist, modern, and functional fashion essentials designed to last beyond the season."},
    {"name": "Zara", "slug": "zara", "description": "Cutting-edge runway trends made accessible, with weekly design updates."},
    {"name": "Nike", "slug": "nike", "description": "High-performance sports apparel, equipment, and iconic streetwear sneakers."},
    {"name": "Atelier", "slug": "atelier", "description": "Bespoke, premium fashion silhouettes handcrafted from natural, luxury textiles."},
    {"name": "Levi's", "slug": "levis", "description": "The global authority in premium denim, pioneering jeans culture since 1873."},
    {"name": "Ralph Lauren", "slug": "ralph-lauren", "description": "Classic American style blending preppy collegiate tailoring with luxury sport."},
    {"name": "Gucci", "slug": "gucci", "description": "Eclectic, contemporary, and romantic Italian haute couture and luxury goods."},
    {"name": "Acne Studios", "slug": "acne-studios", "description": "Stockholm-based multidisciplinary luxury house known for elevated tailored basics."},
    {"name": "Birkenstock", "slug": "birkenstock", "description": "Ergonomic, premium cork-footbed sandals built for wellness and durability."},
    {"name": "Rolex", "slug": "rolex", "description": "The ultimate global standard in luxury mechanical wristwatches."}
]

CATEGORIES_DATA = {
    "Men": ["T-Shirts", "Shirts", "Polo Shirts", "Hoodies", "Jackets", "Sweaters", "Jeans", "Trousers", "Shorts", "Blazers", "Suits"],
    "Women": ["Dresses", "Tops", "Blouses", "Shirts", "Skirts", "Jeans", "Trousers", "Knitwear", "Jackets", "Coats"],
    "Accessories": ["Bags", "Wallets", "Belts", "Sunglasses", "Watches", "Hats", "Scarves"],
    "Shoes": ["Sneakers", "Boots", "Sandals", "Loafers", "Heels"]
}

COLLECTIONS_DATA = [
    {"name": "New Arrivals", "slug": "new-arrivals", "description": "Be the first to shop the latest silhouettes and seasonal wardrobe additions."},
    {"name": "Best Sellers", "slug": "best-sellers", "description": "Our most popular, customer-loved staples, restocked by popular demand."},
    {"name": "Trending Now", "slug": "trending-now", "description": "Curated editorial highlights showcasing the season's hottest styling patterns."},
    {"name": "Summer Collection", "slug": "summer-collection", "description": "Light, breathable organic fabrics tailored for hot summer afternoons."},
    {"name": "Winter Collection", "slug": "winter-collection", "description": "Insulated outerwear, cashmere layers, and tailored heavy wool jackets."},
    {"name": "Spring Collection", "slug": "spring-collection", "description": "Pastel layers, lightweight knits, and seasonal rainwear essentials."},
    {"name": "Autumn Collection", "slug": "autumn-collection", "description": "Earth-toned knits, utility shackets, and classic raw denim staples."},
    {"name": "Office Wear", "slug": "office-wear", "description": "Crisp shirts, structured blazers, and professional smart trousers."},
    {"name": "Casual Wear", "slug": "casual-wear", "description": "Comfort-first loungewear, organic tees, and easy weekend trousers."},
    {"name": "Essentials", "slug": "essentials", "description": "Timeless, core wardrobe foundational garments designed to match any outfit."},
    {"name": "Premium Collection", "slug": "premium-collection", "description": "Limited batch tailoring using high-tier Italian and Japanese textiles."},
    {"name": "Limited Edition", "slug": "limited-edition", "description": "Exclusive, individually-numbered statement pieces that will not be reproduced."},
    {"name": "Organic Cotton", "slug": "organic-cotton", "description": "Sustainably harvested, hypoallergenic cotton basics made with zero chemical dyes."},
    {"name": "Linen Collection", "slug": "linen-collection", "description": "Relaxed French linen shirts, trousers, and skirts for breezy resort styling."},
    {"name": "Luxury Edit", "slug": "luxury-edit", "description": "The pinnacle of high fashion refinement, featuring cashmere, silk, and fine leathers."}
]

CAMPAIGNS_DATA = [
    {"name": "Summer Campaign", "slug": "summer-campaign", "promotional_copy": "Refined staples crafted in lightweight organic fabrics. Designed to breathe, made to endure.", "badge": "NEW SEASON", "cta_text": "Shop Summer Campaign", "cta_link": "/products?collection=summer-collection", "desktop": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600", "mobile": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600", "priority": 10},
    {"name": "Winter Collection", "slug": "winter-collection-camp", "promotional_copy": "Tailored heavy wool blazers, premium cashmere layers, and weather-proof outerwear.", "badge": "COLD WEATHER EDIT", "cta_text": "Explore Outerwear", "cta_link": "/products?collection=winter-collection", "desktop": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600", "mobile": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600", "priority": 8},
    {"name": "Black Friday", "slug": "black-friday", "promotional_copy": "Enjoy exclusive store-wide savings on premium apparel and accessories. Limited time only.", "badge": "HOLIDAY DEALS", "cta_text": "Shop the Sale", "cta_link": "/products?discount=true", "desktop": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600", "mobile": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600", "priority": 12},
    {"name": "Cyber Monday", "slug": "cyber-monday", "promotional_copy": "Final markdown savings online only. Free global shipping on all premium items.", "badge": "ONLINE EXCLUSIVE", "cta_text": "Access Markdowns", "cta_link": "/products", "desktop": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600", "mobile": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600", "priority": 11},
    {"name": "Spring Essentials", "slug": "spring-essentials", "promotional_copy": "Welcome warmer days with fluid silk blouses, breathable cotton knits, and transition trenches.", "badge": "FRESH STYLES", "cta_text": "Shop Spring", "cta_link": "/products?collection=spring-collection", "desktop": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600", "mobile": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600", "priority": 7},
    {"name": "New Season", "slug": "new-season", "promotional_copy": "Discover the latest arrivals in luxury tailoring and minimal daily essentials.", "badge": "JUST IN", "cta_text": "Shop New Arrivals", "cta_link": "/products?collection=new-arrivals", "desktop": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600", "mobile": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600", "priority": 9},
    {"name": "Limited Edition", "slug": "limited-edition-camp", "promotional_copy": "Exclusive, individually-numbered statement pieces that will not be reproduced.", "badge": "COLLECTORS EDIT", "cta_text": "Shop Limited Edition", "cta_link": "/products?collection=limited-edition", "desktop": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1600", "mobile": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600", "priority": 15},
    {"name": "Holiday Collection", "slug": "holiday-collection", "promotional_copy": "Curated gifting edits and elegant eveningwear silhouettes for the festive season.", "badge": "FESTIVE EDIT", "cta_text": "Shop Gifting", "cta_link": "/products", "desktop": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1600", "mobile": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600", "priority": 13},
    {"name": "Weekend Sale", "slug": "weekend-sale", "promotional_copy": "Take an extra 15% off casual staples and luxury denim this weekend only.", "badge": "FLASH SALE", "cta_text": "Unlock Discounts", "cta_link": "/products?discount=true", "desktop": "https://images.unsplash.com/photo-1534653274761-41aae9799b40?w=1600", "mobile": "https://images.unsplash.com/photo-1534653274761-41aae9799b40?w=600", "priority": 14},
    {"name": "Mid Season Sale", "slug": "mid-season-sale", "promotional_copy": "Save up to 40% off premium shirts, dresses, trousers, and luxury leather footwear.", "badge": "MARKDOWNS", "cta_text": "Shop Sale", "cta_link": "/products?discount=true", "desktop": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600", "mobile": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600", "priority": 5},
    {"name": "Back to Work", "slug": "back-to-work", "promotional_copy": "Modern workwear designed for ultimate focus. Crease-resistant shirts and comfortable trousers.", "badge": "OFFICE EDIT", "cta_text": "Shop Workwear", "cta_link": "/products?collection=office-wear", "desktop": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600", "mobile": "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600", "priority": 4},
    {"name": "Premium Essentials", "slug": "premium-essentials", "promotional_copy": "Elevate your daily outfits with top-tier fabrics. Simple lines, extraordinary construction.", "badge": "CLASSICS REIMAGINED", "cta_text": "Shop Essentials", "cta_link": "/products?collection=essentials", "desktop": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600", "mobile": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600", "priority": 3}
]

FABRIC_SPECS = [
    {"Fabric": "100% GOTS Certified Organic Cotton", "Weight": "240 GSM Heavyweight", "Care": "Machine wash cold, tumble dry low, warm iron if needed."},
    {"Fabric": "80% Merino Wool, 20% Recycled Cashmere", "Weight": "Medium Weight Knit", "Care": "Dry clean recommended. Hand wash cold with wool detergent, reshape and dry flat."},
    {"Fabric": "100% French Flax Linen", "Weight": "160 GSM Lightweight", "Care": "Machine wash warm, line dry. Iron damp for a crisp finish."},
    {"Fabric": "98% Premium Raw Denim, 2% Elastane", "Weight": "13.5 oz Selvedge", "Care": "Wash sparingly. Turn inside out, wash cold separately. Hang to dry."},
    {"Fabric": "100% Mulberry Silk", "Weight": "Fluid 16 Momme Satin", "Care": "Dry clean only. Do not bleach. Cool iron under protective cloth."},
    {"Fabric": "100% Full-Grain Calfskin Leather", "Weight": "N/A", "Care": "Specialist leather cleaning only. Store in a cool, dry place in dustbag."}
]

COLORS_SWATCH = {
    "Oatmeal": "#E8DCC4", "Charcoal": "#36454F", "Espresso": "#3D2B1F", 
    "Off-White": "#F8F6F0", "Sage": "#9FAF90", "Rust": "#B7410E", 
    "Navy": "#000080", "Black": "#000000", "Olive": "#556B2F",
    "Camel": "#C19A6B", "Cream": "#FFFDD0", "Indigo": "#4B0082"
}

SIZES_CLOTHING = ["XS", "S", "M", "L", "XL", "XXL"]
SIZES_SHOES = ["7", "8", "9", "10", "11", "12"]
SIZES_ACCESSORIES = ["OS (One Size)"]

REVIEWS_TEMPLATES = [
    {"rating": 5, "title": "Stunning quality and perfect fit", "content": "I am absolutely blown away by the quality of this item. The fabric is thick, soft, and has a premium weight to it. Fits true to size and looks incredibly elegant."},
    {"rating": 5, "title": "A capsule wardrobe staple!", "content": "Clean lines, beautiful stitching, and feels amazing to wear. I've already styled it multiple ways. Buying other colors immediately!"},
    {"rating": 4, "title": "Very elegant, slightly relaxed", "content": "Love the minimalist design. Fabric feels premium and expensive. It is slightly oversized, so size down if you prefer a structured silhouette."},
    {"rating": 5, "title": "Absolutely beautiful fabric", "content": "You can tell this is made from organic premium materials. It feels soft on the skin and breathes so well. Worth every single penny."},
    {"rating": 3, "title": "Nice design, but sizing is big", "content": "The material is high quality and the styling is great, but it runs a bit larger than expected. Had to exchange it for a smaller size."}
]

def generate_specifications(category_name, product_name):
    # Select fabric spec based on name keywords
    if "linen" in product_name.lower():
        spec = FABRIC_SPECS[2].copy()
    elif "wool" in product_name.lower() or "cashmere" in product_name.lower() or "sweater" in product_name.lower():
        spec = FABRIC_SPECS[1].copy()
    elif "denim" in product_name.lower() or "jeans" in product_name.lower():
        spec = FABRIC_SPECS[3].copy()
    elif "silk" in product_name.lower() or "blouse" in product_name.lower():
        spec = FABRIC_SPECS[4].copy()
    elif "leather" in product_name.lower() or "boot" in product_name.lower() or "bag" in product_name.lower() or "belt" in product_name.lower() or "wallet" in product_name.lower():
        spec = FABRIC_SPECS[5].copy()
    else:
        spec = FABRIC_SPECS[0].copy()
    
    spec.update({
        "Fit": "Relaxed modern silhouette" if "relaxed" in product_name.lower() or "oversized" in product_name.lower() else "Tailored slim fit",
        "Country of Origin": "Handcrafted in Portugal" if random.random() > 0.5 else "Made in Italy"
    })
    return spec

def generate_seo(product_name, category_name, brand_name):
    desc = f"Shop the premium {product_name} by {brand_name}. High-quality clothing from our {category_name} catalog. Free global shipping on orders over $150."
    keywords = [product_name.lower(), brand_name.lower(), category_name.lower(), "fashion", "premium e-commerce", "atelier collection"]
    return {
        "title": f"{product_name} | {brand_name} Official Store",
        "description": desc,
        "keywords": ",".join(keywords)
    }

def seed_data():
    print("--- Cleaning and Initializing Schema and Seeding Data ---")
    
    # Drop all tables first to guarantee a clean reseeding
    Base.metadata.drop_all(bind=engine)
    print("Old tables dropped.")
    
    # Create all tables on the active database connection
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

    db = SessionLocal()
    try:
        print("Seeding test users...")
        # 1. Seed Users (Admin, Customer)
        admin_user = User(
            email="admin@premiumfashion.com",
            password_hash=hash_password("admin123"),
            role="admin",
            first_name="Alexander",
            last_name="McQueen",
            is_verified=True
        )
        customer_user = User(
            email="customer@premiumfashion.com",
            password_hash=hash_password("customer123"),
            role="customer",
            first_name="Jane",
            last_name="Doe",
            is_verified=True
        )
        db.add_all([admin_user, customer_user])
        db.flush()

        # Seed Customer Address
        address = UserAddress(
            user_id=customer_user.id,
            type="shipping",
            address_line1="123 Fashion Ave",
            address_line2="Apt 4B",
            city="New York",
            state="NY",
            postal_code="10001",
            country="United States",
            phone="+12125550199",
            is_default=True
        )
        db.add(address)
        db.flush()

        print("Seeding brands...")
        # 2. Seed Brands
        brands_db = []
        for brand in BRANDS_DATA:
            b = Brand(name=brand["name"], slug=brand["slug"], description=brand["description"])
            db.add(b)
            brands_db.append(b)
        db.flush()

        print("Seeding categories...")
        # 3. Seed Categories
        categories_db = {}
        for parent_name, subcats in CATEGORIES_DATA.items():
            parent_cat = Category(name=parent_name, slug=parent_name.lower(), description=f"Explore premium {parent_name.lower()} designs.")
            db.add(parent_cat)
            db.flush()
            categories_db[parent_name] = {"parent": parent_cat, "subs": []}
            for sub in subcats:
                clean_sub = sub.lower().replace(' ', '-').replace('&', 'and').replace("'", "")
                slug = f"{parent_name.lower()}-{clean_sub}"
                sub_cat = Category(name=sub, slug=slug, description=f"Shop dynamic {sub.lower()} collections.", parent_id=parent_cat.id)
                db.add(sub_cat)
                categories_db[parent_name]["subs"].append(sub_cat)
        db.flush()

        print("Seeding collections...")
        # 4. Seed Collections
        collections_db = []
        for col in COLLECTIONS_DATA:
            c = Collection(
                name=col["name"],
                slug=col["slug"],
                description=col["description"],
                start_date=datetime.now(timezone.utc) - timedelta(days=60),
                end_date=datetime.now(timezone.utc) + timedelta(days=120)
            )
            db.add(c)
            collections_db.append(c)
        db.flush()

        print("Seeding campaigns...")
        # 5. Seed Campaigns
        campaigns_db = []
        for camp in CAMPAIGNS_DATA:
            col_match = next((col for col in collections_db if col.slug in camp["slug"]), None)
            c = Campaign(
                name=camp["name"],
                slug=camp["slug"],
                description=f"Promoting the stylish {camp['name']}",
                desktop_banner_url=camp["desktop"],
                mobile_banner_url=camp["mobile"],
                collection_id=col_match.id if col_match else random.choice(collections_db).id,
                cta_text=camp["cta_text"],
                cta_link=camp["cta_link"],
                priority=camp["priority"],
                is_active=True,
                badge=camp["badge"],
                promotional_copy=camp["promotional_copy"],
                start_date=datetime.now(timezone.utc) - timedelta(days=10),
                end_date=datetime.now(timezone.utc) + timedelta(days=30)
            )
            db.add(c)
            campaigns_db.append(c)
        db.flush()

        print("Seeding coupons...")
        # 6. Seed Coupons
        coupons = [
            Coupon(code="WELCOME10", discount_type="percentage", discount_value=Decimal("10.00"), min_order_value=Decimal("50.00"), start_date=datetime.now(timezone.utc) - timedelta(days=5), expiry_date=datetime.now(timezone.utc) + timedelta(days=365), max_uses=1000, uses_count=12),
            Coupon(code="SUMMER20", discount_type="percentage", discount_value=Decimal("20.00"), min_order_value=Decimal("80.00"), start_date=datetime.now(timezone.utc) - timedelta(days=5), expiry_date=datetime.now(timezone.utc) + timedelta(days=60), max_uses=500, uses_count=45),
            Coupon(code="BLACKFRIDAY30", discount_type="percentage", discount_value=Decimal("30.00"), min_order_value=Decimal("100.00"), start_date=datetime.now(timezone.utc) - timedelta(days=5), expiry_date=datetime.now(timezone.utc) + timedelta(days=15), max_uses=2000, uses_count=180),
            Coupon(code="LUXEDIT50", discount_type="fixed", discount_value=Decimal("50.00"), min_order_value=Decimal("250.00"), start_date=datetime.now(timezone.utc) - timedelta(days=2), expiry_date=datetime.now(timezone.utc) + timedelta(days=120), max_uses=200, uses_count=5)
        ]
        db.add_all(coupons)
        db.flush()

        print("Generating 300+ fashion products...")
        # 7. Generate 300+ Products (10 per subcategory)
        products_db = []
        all_variants_db = []
        
        # Product descriptor matrices to programmatically build realistic product names
        adj = ["Minimalist", "Oversized", "Relaxed", "Tailored", "Premium", "Structured", "Ribbed", "Classic", "Textured", "Eco-Conscious", "Fluid", "Modern"]
        material = ["Organic Cotton", "French Linen", "Merino Wool", "Cashmere Blend", "Selvedge Denim", "Raw Denim", "Satin Silk", "Mulberry Silk", "Full-Grain Leather", "Suede Leather"]
        
        product_count = 0
        for parent_name, cat_info in categories_db.items():
            parent_key = parent_name.lower()
            if parent_key not in UNSPLASH_IDS:
                parent_key = "accessories" # default fallback
                
            unsplash_ids_pool = UNSPLASH_IDS[parent_key]
            
            for sub_cat in cat_info["subs"]:
                sub_name = sub_cat.name
                
                # Suffixes based on sub category
                item_word = sub_name.rstrip("s") # singular
                if sub_name == "Jeans" or sub_name == "Trousers" or sub_name == "Shorts" or sub_name == "Heels" or sub_name == "Boots" or sub_name == "Sneakers" or sub_name == "Sandals" or sub_name == "Loafers":
                    item_word = sub_name
                
                # Generate 10 products per subcategory
                for i in range(1, 11):
                    brand = random.choice(brands_db)
                    collection = random.choice(collections_db) if random.random() > 0.3 else None
                    
                    # Programmatic name generator
                    p_name = f"{random.choice(adj)} {random.choice(material)} {item_word}"
                    # Append index to guarantee uniqueness
                    p_name = f"{p_name} No. {random.randint(100, 999)}"
                    slug = f"{brand.slug}-{p_name.lower().replace(' ', '-').replace('.', '').replace('#', '')}-{str(uuid.uuid4())[:8]}"
                    
                    price = Decimal(f"{random.randint(4, 40) * 10 - 0.10:.2f}")
                    if brand.name in ["Gucci", "Rolex"]:
                        price = Decimal(f"{random.randint(15, 120) * 100 - 0.10:.2f}")
                    
                    discount_price = None
                    if random.random() > 0.7:
                        discount_price = Decimal(f"{float(price) * 0.8:.2f}") # 20% discount
                    
                    short_desc = f"A premium {p_name.lower()} featuring elevated detailing, constructed from select high-quality materials."
                    desc = f"Introducing the {p_name} by {brand.name}. Engineered for comfort and longevity, this {item_word.lower()} demonstrates our commitment to sustainable sourcing and high-end design craftsmanship. Featuring structured seaming, customized finishes, and a classic fit that accommodates layering. This essential piece represents the pinnacle of modern luxury retail."
                    
                    p = Product(
                        name=p_name,
                        slug=slug,
                        description=desc,
                        short_description=short_desc,
                        brand_id=brand.id,
                        category_id=sub_cat.id,
                        price=price,
                        discount_price=discount_price,
                        is_active=True,
                        specifications=generate_specifications(sub_name, p_name),
                        seo_metadata=generate_seo(p_name, sub_name, brand.name)
                    )
                    if collection:
                        p.collections.append(collection)
                        if random.random() > 0.8:
                            other_col = next((c for c in collections_db if c.id != collection.id), None)
                            if other_col:
                                p.collections.append(other_col)
                    db.add(p)
                    db.flush()
                    products_db.append(p)
                    product_count += 1
                    
                    # Generate variants (2-3 colors, 3-4 sizes)
                    # Pick colors
                    num_colors = random.randint(2, 3)
                    p_colors = random.sample(list(COLORS_SWATCH.keys()), num_colors)
                    
                    # Pick sizes
                    sizes_pool = SIZES_SHOES if parent_name == "Shoes" else (SIZES_ACCESSORIES if parent_name == "Accessories" else SIZES_CLOTHING)
                    num_sizes = random.randint(3, 4)
                    p_sizes = random.sample(sizes_pool, min(num_sizes, len(sizes_pool)))
                    
                    sku_base = f"{brand.slug[:3].upper()}-{sub_name[:3].upper()}-{str(uuid.uuid4())[:6].upper()}"
                    
                    # Store created variants grouped by color to associate images
                    created_variants_by_color = {}
                    
                    for color in p_colors:
                        created_variants_by_color[color] = []
                        for size in p_sizes:
                            sku = f"{sku_base}-{color[:3].upper()}-{size}"
                            stock = random.randint(0, 45)
                            # Introduce some low stock items (for admin panel testing)
                            if random.random() > 0.85:
                                stock = random.randint(0, 4)
                                
                            v = ProductVariant(
                                product_id=p.id,
                                sku=sku,
                                color=color,
                                size=size,
                                stock=stock
                            )
                            db.add(v)
                            all_variants_db.append(v)
                            created_variants_by_color[color].append(v)
                    
                    db.flush() # Flush to populate variant IDs
                    
                    # Generate product images (default fallbacks + color-specific)
                    shuffled_unsplash = list(unsplash_ids_pool)
                    random.shuffle(shuffled_unsplash)
                    image_index = 0
                    
                    # 1. 2 default fallback images (no variant_id)
                    for idx in range(2):
                        unsplash_id = shuffled_unsplash[image_index % len(shuffled_unsplash)]
                        image_index += 1
                        img_url = f"https://images.unsplash.com/photo-{unsplash_id}?q=80&w=800&auto=format&fit=crop"
                        img = ProductImage(product_id=p.id, image_url=img_url, sort_order=idx+1, variant_id=None)
                        db.add(img)
                    
                    # 2. 2 color-specific images per color variant
                    sort_order_counter = 3
                    for color in p_colors:
                        # Grab first variant of this color to assign variant_id
                        if color in created_variants_by_color and created_variants_by_color[color]:
                            target_var = created_variants_by_color[color][0]
                            for idx in range(2):
                                unsplash_id = shuffled_unsplash[image_index % len(shuffled_unsplash)]
                                image_index += 1
                                img_url = f"https://images.unsplash.com/photo-{unsplash_id}?q=80&w=800&auto=format&fit=crop"
                                img = ProductImage(
                                    product_id=p.id, 
                                    variant_id=target_var.id, 
                                    image_url=img_url, 
                                    sort_order=sort_order_counter
                                )
                                sort_order_counter += 1
                                db.add(img)
                
                print(f"  Created {product_count} products so far...")
        
        db.flush()
        print(f"Total products created: {len(products_db)}")
        print(f"Total variants created: {len(all_variants_db)}")

        # 8. Post-populate Related Product IDs (Same category)
        print("Populating related products...")
        for p in products_db:
            # Find products in the same category
            siblings = [sib.id for sib in products_db if sib.category_id == p.category_id and sib.id != p.id]
            # Select 3 random siblings
            chosen = random.sample(siblings, min(3, len(siblings)))
            p.related_product_ids = [str(uid) for uid in chosen]
        db.flush()

        # 9. Seed Customer Reviews
        print("Seeding reviews...")
        reviews_db = []
        for i in range(120):
            p = random.choice(products_db)
            t = random.choice(REVIEWS_TEMPLATES)
            status = "approved" if random.random() > 0.2 else ("pending" if random.random() > 0.5 else "rejected")
            r = Review(
                product_id=p.id,
                user_id=customer_user.id,
                rating=t["rating"],
                title=t["title"],
                content=t["content"],
                status=status,
                is_verified_purchase=random.random() > 0.3,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 45))
            )
            db.add(r)
            reviews_db.append(r)
        db.flush()

        # 10. Seed Customer Lookbook Gallery Images
        print("Seeding customer gallery...")
        gallery_unsplash = [
            "1509631179647-0177331693ae", "1485968579580-b6d095142e6e",
            "1492562080023-ab3db95bfbce", "1488161628813-04466f872be2",
            "1529139574466-a303027c1d8b", "1503342217505-b0a15ec3261c",
            "1501196354995-cbb51c65aaea", "1517841905240-472988babdf9"
        ]
        for idx in range(35):
            p = random.choice(products_db)
            photo_id = random.choice(gallery_unsplash)
            status = "approved" if random.random() > 0.2 else "pending"
            gi = ProductCustomerImage(
                product_id=p.id,
                user_id=customer_user.id,
                image_url=f"https://images.unsplash.com/photo-{photo_id}?q=80&w=800&auto=format&fit=crop",
                caption=f"Loving my new look from Atelier! #{p.brand.name.lower()} #ootd",
                status=status,
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(1, 20))
            )
            db.add(gi)
        db.flush()

        # 11. Seed Orders & Payments
        print("Seeding dummy orders for analytics dashboard...")
        # 15 orders scattered across past 14 days
        for idx in range(1, 20):
            # Select 1-3 random variants
            o_variants = random.sample(all_variants_db, random.randint(1, 3))
            
            total_amount = Decimal("0.00")
            order_items = []
            
            for v in o_variants:
                qty = random.randint(1, 2)
                price = v.product.price
                if v.product.discount_price:
                    price = v.product.discount_price
                
                total_amount += price * qty
                
                oi = OrderItem(
                    variant_id=v.id,
                    quantity=qty,
                    unit_price=price,
                    discount_applied=Decimal("0.00")
                )
                order_items.append(oi)
            
            discount = Decimal("0.00")
            if random.random() > 0.7:
                discount = Decimal(f"{float(total_amount) * 0.1:.2f}") # 10% coupon discount
            
            shipping = Decimal("15.00") if total_amount < 150 else Decimal("0.00")
            tax = Decimal(f"{(float(total_amount) - float(discount)) * 0.08:.2f}")
            grand_total = total_amount - discount + tax + shipping
            
            order_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 15), hours=random.randint(1, 23))
            
            shipping_snap = {
                "first_name": customer_user.first_name,
                "last_name": customer_user.last_name,
                "phone": "+12125550199",
                "email": customer_user.email,
                "address_line1": "123 Fashion Ave",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "country": "United States"
            }
            
            order_num = f"AT-{order_date.strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
            status_opts = ["delivered", "shipped", "processing", "pending"]
            weight = [0.6, 0.2, 0.1, 0.1]
            status = random.choices(status_opts, weights=weight)[0]
            
            o = Order(
                order_number=order_num,
                user_id=customer_user.id,
                status=status,
                total_amount=total_amount,
                discount_amount=discount,
                tax_amount=tax,
                shipping_amount=shipping,
                grand_total=grand_total,
                shipping_address=shipping_snap,
                billing_address=shipping_snap,
                created_at=order_date,
                updated_at=order_date
            )
            db.add(o)
            db.flush()
            
            # Link order items
            for oi in order_items:
                oi.order_id = o.id
                db.add(oi)
            
            # Create payment
            pay_status = "captured" if status != "pending" else "pending"
            pay = Payment(
                order_id=o.id,
                transaction_id=f"tx_{str(uuid.uuid4())[:18]}",
                provider="stripe",
                method="card",
                amount=grand_total,
                status=pay_status,
                created_at=order_date
            )
            db.add(pay)
            
            # Create shipment
            ship_status = "delivered" if status == "delivered" else ("in_transit" if status == "shipped" else "pending")
            ship = Shipment(
                order_id=o.id,
                provider="steadfast",
                tracking_number=f"SF-{random.randint(100000, 999999)}",
                status=ship_status,
                created_at=order_date
            )
            db.add(ship)
            
            # Log audit
            al = AuditLog(
                user_id=customer_user.id,
                action="place_order",
                context={"order_number": order_num, "total": float(grand_total)},
                created_at=order_date
            )
            db.add(al)

        db.commit()
        print("--- Database cleaned and seeded successfully with 330 items, campaigns, lookbooks and metrics! ---")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
