import os
import cv2
import numpy as np

raw_img_path = r'c:\Users\shuvr\.gemini\antigravity-ide\brain\ebe64922-d4a0-4e42-a269-079065d511ee\.user_uploaded\media_1791108570615.png'
public_dir = 'public'

# Ensure the output folders exist
os.makedirs(public_dir, exist_ok=True)
os.makedirs('src/app', exist_ok=True)

if not os.path.exists(raw_img_path):
    print(f"❌ Error: '{raw_img_path}' was not found in the root folder. Please save the logo there first!")
    exit(1)

# Read the image asset
img = cv2.imread(raw_img_path)

# 1. Standard Logo Output
cv2.imwrite(os.path.join(public_dir, 'logo.png'), img)
print("✅ Generated public/logo.png")

# 2. Transparent Background Conversion (Drops out pure white backgrounds)
# The image has a blue background? Let's check: 
# The prompt says: removing any solid white background framing
# The image is actually a blue square with a white block and a logo inside. 
# "Create a background-isolated copy (removing any solid white background framing) and save it at: public/logo-transparent.png"
# But looking at the user's provided Python script:
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, alpha = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
b, g, r = cv2.split(img)
transparent_img = cv2.merge([b, g, r, alpha])
cv2.imwrite(os.path.join(public_dir, 'logo-transparent.png'), transparent_img)
print("✅ Generated public/logo-transparent.png")

# 3. 32x32 Favicon Crop
h, w, _ = img.shape
crop_x, crop_y = int(w * 0.15), int(h * 0.25)
crop_w, crop_h = int(w * 0.70), int(h * 0.55)
icon_crop = img[crop_y:crop_y+crop_h, crop_x:crop_x+crop_w]
favicon_img = cv2.resize(icon_crop, (32, 32), interpolation=cv2.INTER_AREA)

cv2.imwrite(os.path.join(public_dir, 'favicon.ico'), favicon_img)
cv2.imwrite('src/app/icon.png', favicon_img)
print("✅ Overwrote favicon.ico and src/app/icon.png successfully!")
