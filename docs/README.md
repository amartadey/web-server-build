# HestiaCP Development Server - Complete Rebuild Guide

An interactive, comprehensive guide for building a professional development server with HestiaCP, Cloudflare Tunnel, WordPress, and Mailpit.

## 🚀 Features

- **Modern, Interactive Design** - Beautiful glassmorphism UI with smooth animations
- **Comprehensive Documentation** - 12-part step-by-step guide
- **Beginner Friendly** - Assumes no prior Linux knowledge
- **Mobile Responsive** - Works perfectly on all devices
- **Search Functionality** - Quickly find what you need
- **Copy Code Buttons** - One-click code copying
- **Progress Tracking** - Visual progress bar and checklist
- **Table of Contents** - Easy navigation on each page

## 📋 What's Included

### Pages

1. **index.html** - Landing page with overview and architecture
2. **prerequisites.html** - Requirements and checklist
3. **installation.html** - Complete installation guide (Parts 1-12)
4. **configuration.html** - Advanced configuration options
5. **troubleshooting.html** - Common issues and solutions
6. **reference.html** - Quick reference and commands

### Tech Stack

- **Ubuntu 22.04 LTS** - Operating system
- **HestiaCP** - Control panel
- **Cloudflare Tunnel** - Public access without port forwarding
- **Docker** - Containerization
- **WordPress** - CMS
- **Mailpit** - Email testing

## 🎯 What You'll Build

A complete development server with:

- ✅ HestiaCP control panel at `server.webgraphicshub.com`
- ✅ WordPress development site at `dev.webgraphicshub.com`
- ✅ Mailpit email testing at `email.webgraphicshub.com`
- ✅ VS Code remote development support
- ✅ Team collaboration features
- ✅ Automatic SSL/TLS encryption
- ✅ DDoS protection via Cloudflare

## 📦 Installation

### Option 1: GitHub Pages (Recommended)

1. Fork or clone this repository
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click Save
6. Your site will be live at `https://yourusername.github.io/repository-name/`

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/server-rebuild-guide.git
cd server-rebuild-guide
```

2. Open with a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using PHP
php -S localhost:8000

# Using Node.js (http-server)
npx http-server
```

3. Open `http://localhost:8000` in your browser

### Option 3: Direct File Access

Simply open `index.html` in your web browser. All resources are included locally.

## 🛠️ Customization

### Update Domain Names

Replace `webgraphicshub.com` with your actual domain throughout the HTML files.

### Change Color Scheme

Edit `css/style.css` and modify the CSS variables:

```css
:root {
    --primary: #6366f1;
    --secondary: #8b5cf6;
    --accent: #ec4899;
    /* ... */
}
```

### Add Your Logo

Replace the server icon in the navigation with your logo:

```html
<div class="nav-brand">
    <img src="images/your-logo.png" alt="Logo">
    <span>Your Brand Name</span>
</div>
```

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [HestiaCP](https://hestiacp.com) - Free control panel
- [Cloudflare](https://cloudflare.com) - CDN and tunnel service
- [Docker](https://docker.com) - Containerization platform
- [Mailpit](https://github.com/axllent/mailpit) - Email testing tool
- [Font Awesome](https://fontawesome.com) - Icons

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](troubleshooting.html) page
2. Review the [Quick Reference](reference.html)
3. Open an issue on GitHub

## 🎓 Learning Resources

- [HestiaCP Documentation](https://docs.hestiacp.com)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Docker Documentation](https://docs.docker.com)
- [WordPress Codex](https://codex.wordpress.org)

---

**Last Updated:** December 26, 2025

**Estimated Setup Time:** ~60 minutes

**Difficulty:** Beginner Friendly

Made with ❤️ for developers who want a professional development server
