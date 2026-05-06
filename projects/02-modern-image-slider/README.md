# Nebula Slider - Premium Image Carousel

A modern, fully responsive image slider with smooth animations, touch support, and autoplay — perfect for professional websites, portfolios, and landing pages.

![Preview]


## 👨‍💻 Author

**Mostafizur Rahman**

* GitHub: https://github.com/Mostafizur-code/
* Email: [mostafizur.dns@gmail.com
](mailto:mostafizur.dns@gmail.com
)


## ✨ Features

### Core Functionality
- ✅ **Smooth hybrid animation** – Combines fade transition with subtle slide movement for a premium feel
- ✅ **Autoplay** – Configurable interval (3–5 seconds) with progress bar indicator
- ✅ **Manual navigation** – Previous/Next arrows with hover effects + clickable dot indicators
- ✅ **Pause on hover** – Automatically pauses autoplay when user interacts
- ✅ **Touch/swipe support** – Fully functional on mobile devices (works with both touch and mouse drag)
- ✅ **Fully responsive** – Adapts seamlessly to desktop, tablet, and mobile viewports

### Design & Effects
- 🎨 **Ken Burns zoom effect** – Subtle slow-zoom animation on active images
- 🌟 **Elegant overlay text** – Each slide includes heading, subheading, and call-to-action button
- 📊 **Animated progress bar** – Shows remaining time before next slide
- 🔘 **Animated dots** – Active dot expands and changes color with smooth transition
- 🌈 **Gradient overlay** – Improves text readability while maintaining image visibility
- 🎯 **CSS Variables** – Easy customization of colors, timings, and dimensions

### Performance
- 🚀 **Lazy loading** – Images load only when needed for faster initial page load
- ⚡ **Optimized animations** – Uses `transform` and `opacity` for hardware acceleration
- 📦 **Zero dependencies** – Pure HTML, CSS, and JavaScript – no external frameworks

## 🖼️ Demo Slides

The slider includes 5 high-quality placeholder images from Unsplash:

| Slide | Title | Description |
|-------|-------|-------------|
| 1 | Alpine Majesty | Discover untouched landscapes where serenity meets adventure |
| 2 | Enchanted Woods | Ancient trees, golden mist, and the whisper of the wild |
| 3 | Horizon Dreams | Where the sky kisses the earth. Experience panoramic tranquility |
| 4 | Golden Canopy | Sunlight filtering through ancient oaks |
| 5 | Celestial Night | Under a blanket of stars. Cosmic wonder awaits |

## 🛠️ Technologies Used

- **HTML5** – Semantic structure, accessible markup
- **CSS3** – Flexbox, Grid, custom properties, transitions, backdrop-filter
- **Vanilla JavaScript** – ES6+ features, no external libraries

## 📱 Responsive Breakpoints

| Device | Slider Height | Arrow Size | Text Size |
|--------|---------------|------------|------------|
| Desktop | 85vh | 48px | Normal |
| Tablet | 85vh | 48px | Clamped |
| Mobile | 480px min | 40px | Smaller |

## 🔧 Customization

Easily customize the slider by modifying CSS variables in the `:root` selector:

```css
:root {
    --slider-height: 85vh;           /* Change slider height */
    --slide-transition-duration: 0.7s; /* Adjust animation speed */
    --accent-color: #f7b42c;          /* Primary button/dot color */
    --arrow-bg: rgba(20, 20, 30, 0.55); /* Arrow background */
    --progress-bar-height: 4px;       /* Thickness of progress bar */
}