import { test, expect } from "@playwright/test";

test.describe("Atelier Guest Checkout Pipeline", () => {
  test("should allow a guest user to browse, select variants, and complete order placement", async ({ page }) => {
    // 1. Visit homepage
    await page.goto("http://localhost:3000/");
    await expect(page.locator("text=ATELIER")).toBeVisible();
    await expect(page.locator("text=New Arrivals")).toBeVisible();

    // 2. Navigate to Catalog
    await page.click("text=SHOP ALL");
    await expect(page).toHaveURL(/.*\/products/);
    await expect(page.locator("text=Products Found")).toBeVisible();

    // 3. Click first product card ("Minimalist Cotton T-Shirt")
    await page.click("text=Minimalist Cotton T-Shirt");
    await expect(page).toHaveURL(/.*\/products\/minimalist-cotton-tshirt/);
    await expect(page.locator("h1")).toContainText("Minimalist Cotton T-Shirt");

    // 4. Select Variant (Color: White, Size: M)
    // Select color swatch White
    const whiteSwatch = page.locator('[aria-label="Color: White"]');
    await whiteSwatch.click();
    await expect(whiteSwatch).toHaveAttribute("aria-checked", "true");

    // Select size M
    const mSize = page.locator('[aria-label="Size: M"]');
    await mSize.click();
    await expect(mSize).toHaveAttribute("aria-checked", "true");

    // 5. Add to Cart
    await page.click("button:has-text('Add to Cart')");
    await expect(page.locator("text=Product added to your cart successfully!")).toBeVisible();

    // 6. View Cart page
    await page.click('[aria-label="View shopping cart"]');
    await expect(page).toHaveURL(/.*\/cart/);
    await expect(page.locator("h1")).toContainText("Your Shopping Cart");
    await expect(page.locator("text=Minimalist Cotton T-Shirt")).toBeVisible();

    // Apply coupon
    await page.fill("#coupon", "WELCOME10");
    await page.click("button:has-text('APPLY')");
    await expect(page.locator("text=applied successfully")).toBeVisible();

    // 7. Proceed to Checkout
    await page.click("button:has-text('Proceed to Checkout')");
    await expect(page).toHaveURL(/.*\/checkout/);

    // 8. Fill Shipping Details
    await page.fill("label:has-text('First Name') + input", "John");
    await page.fill("label:has-text('Last Name') + input", "Doe");
    await page.fill("label:has-text('Email Address') + input", "john.doe@example.com");
    await page.fill("label:has-text('Address Line 1') + input", "456 Luxury Blvd");
    await page.fill("label:has-text('City') + input", "Manhattan");
    await page.fill("label:has-text('Postal Code') + input", "10012");
    await page.fill("label:has-text('Country') + input", "United States");
    await page.fill("label:has-text('Phone Number') + input", "+15551234567");

    // Select payment method (bKash)
    await page.click("text=bKash / MFS");

    // 9. Place Order
    await page.click("button:has-text('Confirm and Place Order')");

    // 10. Verify order receipt page displays correct details
    await expect(page.locator("h1")).toContainText("Order Confirmed");
    await expect(page.locator("text=Order Number")).toBeVisible();
    await expect(page.locator("text=Delivery To")).toContainText("Manhattan, United States");
  });
});
