import io
import os
import csv
import zipfile
import uuid
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from PIL import Image

from backend.app.models.product import Product, ProductVariant, ProductImage, Category, Brand, Collection
from backend.app.models.import_log import ImportLog

class ImportService:
    @staticmethod
    def parse_file(file_content: bytes, filename: str) -> List[Dict[str, Any]]:
        """Parses CSV or Excel (.xlsx) files into a list of standardized dictionaries."""
        products = []
        if filename.endswith(".xlsx"):
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(file_content), data_only=True)
            sheet = wb.active
            if not sheet:
                return []
            
            headers = [cell.value for cell in sheet[1]]
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if not any(row):  # Skip empty rows
                    continue
                row_dict = {}
                for idx, val in enumerate(row):
                    if idx < len(headers) and headers[idx]:
                        row_dict[str(headers[idx]).strip().lower().replace(" ", "_")] = val
                products.append(row_dict)
        else:
            # Fallback to CSV
            text_content = file_content.decode("utf-8-sig", errors="ignore")
            reader = csv.DictReader(io.StringIO(text_content))
            for row in reader:
                if not any(row.values()):  # Skip empty rows
                    continue
                row_dict = {k.strip().lower().replace(" ", "_"): v for k, v in row.items() if k}
                products.append(row_dict)
                
        return products

    @staticmethod
    def process_and_compress_image(file_data: bytes, filename: str) -> Tuple[str, str]:
        """Compresses image, generates thumbnail, saves both to static directory and returns their URLs."""
        import os
        unique_id = str(uuid.uuid4())
        ext = os.path.splitext(filename)[1].lower() or ".jpg"
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"

        upload_dir = os.path.join("backend", "static", "uploads")
        os.makedirs(upload_dir, exist_ok=True)

        large_filename = f"{unique_id}{ext}"
        thumb_filename = f"{unique_id}_thumb{ext}"

        large_path = os.path.join(upload_dir, large_filename)
        thumb_path = os.path.join(upload_dir, thumb_filename)

        # Compress large image and generate thumbnail using Pillow
        try:
            img = Image.open(io.BytesIO(file_data))
            
            # Convert RGBA to RGB if saving as JPEG
            if img.mode in ("RGBA", "LA") and ext in (".jpg", ".jpeg"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                img = background

            # Compress and save large version
            img.save(large_path, optimize=True, quality=80)

            # Generate thumbnail (e.g. max 300x300)
            img.thumbnail((300, 300))
            img.save(thumb_path, optimize=True, quality=75)
        except Exception:
            # Fallback if Pillow fails
            with open(large_path, "wb") as f:
                f.write(file_data)
            with open(thumb_path, "wb") as f:
                f.write(file_data)

        return f"/static/uploads/{large_filename}", f"/static/uploads/{thumb_filename}"

    @classmethod
    def extract_images_from_zip(cls, zip_content: bytes) -> Dict[str, Dict[str, Any]]:
        """
        Extracts ZIP file and builds a mapping of matched images by SKU & Color.
        Supports both flat zip files and nested folder structures.
        Returns:
            {
                "SKU_CODE": {
                    "cover": large_url,
                    "thumbnail": thumb_url,
                    "colors": {
                        "black": [large_url1, large_url2],
                        "white": [...]
                    },
                    "general": [large_url1, large_url2]
                }
            }
        """
        import re
        image_map = {}
        try:
            with zipfile.ZipFile(io.BytesIO(zip_content)) as z:
                for file_info in z.infolist():
                    if file_info.is_dir() or file_info.file_size == 0:
                        continue
                    
                    # Normalized relative path, e.g. "products/ATL-0001/black/front.jpg"
                    path_parts = [p for p in file_info.filename.split("/") if p]
                    filename = path_parts[-1]
                    
                    # Skip macOS resource files
                    if filename.startswith(".") or "__MACOSX" in path_parts:
                        continue

                    sku = None
                    color = None

                    # Step 1: Try flat filename parsing first (e.g. SKU-COLOR-INDEX.jpg or SKU-COLOR.jpg)
                    base, ext = os.path.splitext(filename)
                    # Clean trailing index like -1, _1, (1), ( 1), - (1)
                    base_clean = re.sub(r'[-_ ]*\(?\d+\)?$', '', base).strip()
                    
                    # Split from right to identify potential SKU and Color
                    parts = re.split(r'[-_ ]', base_clean)
                    if len(parts) >= 2:
                        last_part = parts[-1]
                        # If the last part is purely alphabetic, it's considered the color
                        if last_part.isalpha() and len(last_part) <= 12: # Avoid matching part of SKU as color
                            color = last_part.lower()
                            sku = base_clean[:-(len(last_part) + 1)].strip('-_ ').upper()
                    
                    # Step 2: Fallback to directory-based parsing if flat parsing didn't identify a SKU
                    # or if the folder structure is explicitly nested
                    if not sku or len(path_parts) >= 3:
                        if len(path_parts) >= 2:
                            sku = path_parts[-2].upper() if len(path_parts) == 2 else path_parts[-3].upper()
                            color = path_parts[-2].lower() if len(path_parts) >= 3 else None

                    if not sku:
                        sku = base_clean.upper()

                    # Extract bytes and save image
                    file_data = z.read(file_info.filename)
                    large_url, thumb_url = cls.process_and_compress_image(file_data, filename)

                    if sku not in image_map:
                        image_map[sku] = {"cover": None, "thumbnail": None, "colors": {}, "general": []}

                    # First encountered image for this SKU is the default cover
                    if not image_map[sku]["cover"]:
                        image_map[sku]["cover"] = large_url
                        image_map[sku]["thumbnail"] = thumb_url

                    if color:
                        if color not in image_map[sku]["colors"]:
                            image_map[sku]["colors"][color] = []
                        image_map[sku]["colors"][color].append(large_url)
                    else:
                        image_map[sku]["general"].append(large_url)

        except Exception as e:
            print(f"Error reading zip: {e}")
        return image_map

    @staticmethod
    def validate_data(data: List[Dict[str, Any]], image_map: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """Runs a dry-run validation checking database references, data types, and ZIP files matching."""
        errors = []
        total_products = len(data)
        total_images = sum(
            1 + len(details["general"]) + sum(len(c_imgs) for c_imgs in details["colors"].values())
            for details in image_map.values()
            if details["cover"]
        )

        seen_skus = set()
        
        # Prefetch brands, categories for speed validation
        existing_categories = {c.name.lower(): c.id for c in db.query(Category).all()}
        existing_brands = {b.name.lower(): b.id for b in db.query(Brand).all()}

        critical_count = 0
        warning_count = 0

        for index, row in enumerate(data, start=2): # Header is row 1
            row_errors = []
            
            # 1. Check SKU
            sku_val = str(row.get("sku") or "").strip().upper()
            if not sku_val:
                row_errors.append({
                    "row": index, "sku": "N/A", "error_type": "critical",
                    "message": "Missing SKU code.", "suggested_fix": "Add a unique alphanumeric SKU."
                })
                critical_count += 1
            else:
                if sku_val in seen_skus:
                    row_errors.append({
                        "row": index, "sku": sku_val, "error_type": "critical",
                        "message": f"Duplicate SKU '{sku_val}' in upload spreadsheet.",
                        "suggested_fix": "Make sure all SKUs are unique."
                    })
                    critical_count += 1
                seen_skus.add(sku_val)
                
                # Check DB for duplicate SKU
                db_variant = db.query(ProductVariant).filter(ProductVariant.sku == sku_val).first()
                if db_variant:
                    row_errors.append({
                        "row": index, "sku": sku_val, "error_type": "warning",
                        "message": f"SKU '{sku_val}' already exists in database. Importing will update stock and pricing details.",
                        "suggested_fix": "Leave as is to update, or change SKU code to create new product."
                    })
                    warning_count += 1

            # 2. Check Name
            name_val = str(row.get("product_name") or row.get("name") or "").strip()
            if not name_val:
                row_errors.append({
                    "row": index, "sku": sku_val, "error_type": "critical",
                    "message": "Product Name is required.", "suggested_fix": "Input a product title."
                })
                critical_count += 1

            # 3. Check Category
            cat_val = str(row.get("category") or "").strip()
            if cat_val and cat_val.lower() not in existing_categories:
                row_errors.append({
                    "row": index, "sku": sku_val, "error_type": "warning",
                    "message": f"Category '{cat_val}' not found in database. System will automatically create it.",
                    "suggested_fix": "System auto-creation will apply. Double check naming spelling if unintended."
                })
                warning_count += 1

            # 4. Check Brand
            brand_val = str(row.get("brand") or "").strip()
            if brand_val and brand_val.lower() not in existing_brands:
                row_errors.append({
                    "row": index, "sku": sku_val, "error_type": "warning",
                    "message": f"Brand Partner '{brand_val}' not found. System will automatically create it.",
                    "suggested_fix": "System auto-creation will apply."
                })
                warning_count += 1

            # 5. Check Prices
            price_val = row.get("price")
            try:
                if price_val is None or float(price_val) <= 0:
                    row_errors.append({
                        "row": index, "sku": sku_val, "error_type": "critical",
                        "message": f"Invalid Price value ({price_val}). Must be a positive numeric value.",
                        "suggested_fix": "Specify a price number greater than 0."
                    })
                    critical_count += 1
            except (ValueError, TypeError):
                row_errors.append({
                    "row": index, "sku": sku_val, "error_type": "critical",
                    "message": f"Non-numeric price format: '{price_val}'.",
                    "suggested_fix": "Replace with a valid decimal/number."
                })
                critical_count += 1

            # 6. Check Images matching
            if sku_val and sku_val not in image_map:
                row_errors.append({
                    "row": index, "sku": sku_val, "error_type": "warning",
                    "message": f"No matching folder or files found in ZIP archive for SKU '{sku_val}'. Product will use placeholder images.",
                    "suggested_fix": "Add images inside folder '{sku_val}/' in the ZIP file."
                })
                warning_count += 1

            errors.extend(row_errors)

        # Compute Readiness Score: starts at 100, drops by 5 per critical, 1 per warning (minimum 0)
        readiness_score = max(0, 100 - (critical_count * 8) - (warning_count * 1))

        return {
            "total_products": total_products,
            "total_images": total_images,
            "readiness_score": readiness_score,
            "critical_errors": critical_count,
            "warnings": warning_count,
            "errors": errors
        }
