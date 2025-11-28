# PWA Icon Setup

## Required Icons

The PWA needs proper PNG icons for installation. Currently, placeholder files exist at:
- `/public/images/icon-192.png` (192x192 pixels)
- `/public/images/icon-512.png` (512x512 pixels)

## How to Generate Icons

### Option 1: Online Tool
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload `/public/images/logo/SQ.svg`
3. Generate icons
4. Replace the placeholder PNG files

### Option 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first
brew install imagemagick

# Convert SVG to PNG icons
convert -background none public/images/logo/SQ.svg -resize 192x192 public/images/icon-192.png
convert -background none public/images/logo/SQ.svg -resize 512x512 public/images/icon-512.png
```

### Option 3: Using Node.js sharp library
```bash
npm install -D sharp-cli
npx sharp -i public/images/logo/SQ.svg -o public/images/icon-192.png resize 192 192
npx sharp -i public/images/logo/SQ.svg -o public/images/icon-512.png resize 512 512
```

## Testing PWA on iPhone

1. Build the app: `npm run build`
2. Serve it: `npm run preview` or deploy to a server with HTTPS
3. Open in Safari on iPhone
4. Tap Share button (square with arrow)
5. Tap "Add to Home Screen"
6. The app should appear as an icon on your home screen

## PWA Features Enabled

✅ Offline support via service worker
✅ App installable on home screen
✅ iOS-specific meta tags for status bar
✅ Viewport optimized for mobile
✅ Push notification support
✅ Standalone display mode
✅ Theme color matching (#fa5b35)
