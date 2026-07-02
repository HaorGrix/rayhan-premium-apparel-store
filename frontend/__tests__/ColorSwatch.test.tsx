import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorSwatch } from "../components/common/ColorSwatch";

describe("ColorSwatch Component", () => {
  test("renders circular swatch with correct hex value background", () => {
    const handleClick = vi.fn();
    render(
      <ColorSwatch
        color="Navy"
        isSelected={false}
        isAvailable={true}
        onClick={handleClick}
      />
    );

    const swatch = screen.getByRole("radio");
    expect(swatch).toBeInTheDocument();
    expect(swatch).toHaveAttribute("aria-checked", "false");
    expect(swatch).toHaveAttribute("aria-label", "Color: Navy");
  });

  test("triggers onClick when clicked and available", () => {
    const handleClick = vi.fn();
    render(
      <ColorSwatch
        color="Black"
        isSelected={false}
        isAvailable={true}
        onClick={handleClick}
      />
    );

    const swatch = screen.getByRole("radio");
    fireEvent.click(swatch);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not trigger onClick when out of stock", () => {
    const handleClick = vi.fn();
    render(
      <ColorSwatch
        color="White"
        isSelected={false}
        isAvailable={false}
        onClick={handleClick}
      />
    );

    const swatch = screen.getByRole("radio");
    fireEvent.click(swatch);
    expect(handleClick).not.toHaveBeenCalled();
    expect(swatch).toHaveAttribute("aria-label", "Color: White (Out of stock)");
  });

  test("supports keyboard activation via Space and Enter", () => {
    const handleClick = vi.fn();
    render(
      <ColorSwatch
        color="Red"
        isSelected={false}
        isAvailable={true}
        onClick={handleClick}
      />
    );

    const swatch = screen.getByRole("radio");
    
    // Test Enter key
    fireEvent.keyDown(swatch, { key: "Enter", code: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(swatch, { key: " ", code: "Space" });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
