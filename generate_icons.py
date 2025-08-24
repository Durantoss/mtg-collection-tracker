#!/usr/bin/env python3
"""
Generate PWA icons for MTG Collection Tracker
Creates all required icon sizes with a simple but effective design
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a single icon of the specified size"""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # MTG-themed colors
    bg_color = (102, 187, 106)  # Green from manifest
    text_color = (255, 255, 255)  # White text
    
    # Draw circular background
    margin = size // 10
    draw.ellipse([margin, margin, size-margin, size-margin], fill=bg_color)
    
    # Draw MTG text
    try:
        # Try to use a system font
        if size >= 128:
            font_size = size // 6
        elif size >= 72:
            font_size = size // 5
        else:
            font_size = size // 4
            
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("Arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Draw MTG text centered
    text = "MTG"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill=text_color, font=font)
    
    # Add a small mana symbol (simplified)
    if size >= 96:
        symbol_size = size // 8
        symbol_x = size - symbol_size - margin - 5
        symbol_y = margin + 5
        draw.ellipse([symbol_x, symbol_y, symbol_x + symbol_size, symbol_y + symbol_size], 
                    fill=(76, 175, 80))  # Slightly different green
    
    return img

def main():
    """Generate all required PWA icons"""
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Required icon sizes for PWA (including favicon sizes)
    sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]
    
    print("Generating PWA icons for MTG Collection Tracker...")
    
    for size in sizes:
        filename = f"icons/icon-{size}x{size}.png"
        print(f"Creating {filename}...")
        
        icon = create_icon(size, filename)
        icon.save(filename, 'PNG')
        
        print(f"✓ Created {filename}")
    
    print(f"\n✅ Successfully generated {len(sizes)} PWA icons!")
    print("Icons saved in the 'icons/' directory")
    
    # Verify all files were created
    print("\nVerifying icons:")
    for size in sizes:
        filename = f"icons/icon-{size}x{size}.png"
        if os.path.exists(filename):
            file_size = os.path.getsize(filename)
            print(f"✓ {filename} ({file_size} bytes)")
        else:
            print(f"✗ {filename} - MISSING!")

if __name__ == "__main__":
    main()
