# HestiaCP Customizations & Quick Links

## Overview
This document describes all custom modifications made to the HestiaCP installation on the development server. These customizations enhance the control panel with additional features and custom branding.

---

## Server Information
- **Server Hostname:** `server.webgraphicshub.com`
- **Development Domain:** `dev.webgraphicshub.com`
- **HestiaCP Version:** 1.9.4
- **Installation Path:** `/usr/local/hestia/`
- **Primary User:** `dev`
- **SSH User:** `rahul`
- **Server IP (Local):** `192.168.29.15`
- **Server IP (Public):** `49.47.152.71`

---

## 1. Custom Branding

### Logo Customization
- **Custom Logo:** Replaced default HestiaCP logo with custom WGH logo
- **Logo Files:**
  - `/usr/local/hestia/web/images/logo.svg` - Main logo
  - `/usr/local/hestia/web/images/logo-header.svg` - Header logo
  - `/usr/local/hestia/web/images/favicon.png` - Favicon

### Footer Customization
- **File:** `/usr/local/hestia/web/templates/includes/app-footer.php`
- **Changes:**
  - Changed "Hestia Control Panel" to "WGH Control Panel"
  - Updated link to `https://webgraphicshub.com/`
  - Added custom JavaScript for phpMyAdmin redirect

---

## 2. phpMyAdmin Redirect

### Problem
phpMyAdmin was installed on `dev.webgraphicshub.com` but HestiaCP links pointed to `server.webgraphicshub.com`

### Solution
Added JavaScript to redirect all phpMyAdmin links to the correct domain.

**File Modified:** `/usr/local/hestia/web/templates/includes/app-footer.php`

**Code Added:**
```javascript
<script>
// Redirect phpMyAdmin links to dev.webgraphicshub.com
document.addEventListener('DOMContentLoaded', function() {
    const pmaLinks = document.querySelectorAll('a[href*="phpmyadmin"]');
    pmaLinks.forEach(link => {
        const currentHref = link.getAttribute('href');
        const newHref = currentHref.replace(/\/\/[^\/]+\/phpmyadmin/, '//dev.webgraphicshub.com/phpmyadmin');
        link.setAttribute('href', newHref);
    });
});
</script>
```

**Also Modified:**
- `/usr/local/hestia/web/templates/pages/list_db.php` (lines 3 and 140)
- Added `$pma_host` variable to point to `dev.webgraphicshub.com`

---

## 3. Quick Links Feature

### Overview
Added a custom "Quick Links" button to the HestiaCP top menu that opens a modal with cards linking to custom tools and services.

### Files Created

#### 1. JavaScript File
**Path:** `/usr/local/hestia/web/js/quick-links.js`
- Contains all Quick Links functionality
- Manages button creation, modal display, and event handling
- **Configuration:** Edit the `QUICK_LINKS` array to add/remove links

#### 2. CSS File
**Path:** `/usr/local/hestia/web/css/quick-links.css`
- Styles for the modal, cards, and animations
- Dark theme matching HestiaCP design
- Responsive layout

#### 3. Footer Include
**File:** `/usr/local/hestia/web/templates/includes/app-footer.php`

**Added after `</footer>`:**
```html
<link rel="stylesheet" href="/css/quick-links.css">
<script src="/js/quick-links.js"></script>
```

### Current Quick Links

1. **WP Password Tools**
   - URL: `https://amartadey.github.io/wp-password/`
   - Description: Generate WordPress password hashes, SQL queries, and emergency reset scripts
   - Icon: `fas fa-key`
   - Color: `#6366f1` (Purple)

2. **Mailpit**
   - URL: `https://email.webgraphicshub.com`
   - Description: Email testing interface
   - Icon: `fas fa-envelope`
   - Color: `#10b981` (Green)

### How to Add More Links

Edit `/usr/local/hestia/web/js/quick-links.js` and add to the `QUICK_LINKS` array:

```javascript
const QUICK_LINKS = [
    // ... existing links ...
    {
        title: 'Your Tool Name',
        description: 'Brief description of the tool',
        url: 'https://example.com',
        image: 'https://example.com/screenshot.png',
        icon: 'fas fa-icon-name',  // FontAwesome icon
        color: '#hexcolor'           // Hex color for icon background
    }
];
```

**Available FontAwesome Icons:** Use any icon from [FontAwesome](https://fontawesome.com/icons)

---

## 4. WordPress Password Tool

### Overview
A client-side web application for WordPress password management, hosted on GitHub Pages.

### Features
- **Password Hash Generator:** Generate bcrypt hashes compatible with WordPress
- **SQL Query Generator:** Create UPDATE queries for database password resets
- **PHP Script Generator:** Generate emergency reset scripts
- **Secure Password Generator:** Create strong random passwords
- **Light/Dark Theme Toggle:** User preference saved in localStorage

### Files Location
**Local Development:** `c:\Users\Raptor\Downloads\New folder (15)\wp-password-tool\`

**Files:**
- `index.html` - Main HTML structure
- `style.css` - Styling with dark theme and glassmorphism
- `script.js` - All functionality including bcrypt hashing
- `README.md` - Documentation

**Live URL:** `https://amartadey.github.io/wp-password/`

### Key Features
- ✅ Auto-generates hash on typing (500ms debounce)
- ✅ Manual "Generate Hash" button as failsafe
- ✅ Hash output appears immediately after password input
- ✅ Light/Dark theme toggle with localStorage persistence
- ✅ Password strength meter
- ✅ One-click copy buttons
- ✅ Fully responsive design

### Dependencies
- **bcrypt.js:** `https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js`
- **Iconify:** `https://code.iconify.design/3/3.1.0/iconify.min.js`
- **Google Fonts (Inter):** For typography

---

## 5. File Upload Limit Configurations

### Nginx Configuration
**File:** `/etc/nginx/nginx.conf`
- `client_max_body_size: 1024m` (1GB)

### PHP Configuration
**File:** `/etc/php/8.3/fpm/php.ini`
- Default upload limits apply

### HestiaCP File Manager
**File:** `/usr/local/hestia/web/fm/configuration.php`
- `upload_max_size: 1024 * 1024 * 1024` (1GB)

### FTP Configuration
**File:** `/etc/vsftpd.conf`
- `pasv_address: 192.168.29.15` (Local network IP)
- File made immutable to prevent HestiaCP auto-updates: `sudo chattr +i /etc/vsftpd.conf`

---

## 6. HestiaCP Pluginable

### Installed Plugins
- **HCPP-NodeApp:** Node.js application management

### Installation Path
- `/usr/local/hestia/plugins/`

---

## 7. Important Commands & Workflows

### Editing Files
**Preferred Editor:** `micro` (not `nano`)

```bash
# Edit Quick Links
sudo micro /usr/local/hestia/web/js/quick-links.js

# Edit Footer
sudo micro /usr/local/hestia/web/templates/includes/app-footer.php

# Edit CSS
sudo micro /usr/local/hestia/web/css/quick-links.css
```

### Restart Services
```bash
# Restart HestiaCP
sudo systemctl restart hestia

# Restart Nginx
sudo systemctl restart nginx

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

### Check Logs
```bash
# HestiaCP Nginx errors
sudo tail -50 /var/log/hestia/nginx-error.log

# System Nginx errors
sudo tail -50 /var/log/nginx/error.log
```

---

## 8. Cloudflare Tunnel Configuration

### Tunnels
1. **server.webgraphicshub.com** → `localhost:8083` (HestiaCP)
2. **dev.webgraphicshub.com** → `localhost:80` (Web server)
3. **email.webgraphicshub.com** → `localhost:8025` (Mailpit)

### Mailpit Configuration
- **Docker Container:** Running Mailpit for email testing
- **Port:** 8025
- **Access:** `https://email.webgraphicshub.com`

---

## 9. Update-Proof Modifications

### Files That Won't Be Overwritten by HestiaCP Updates

✅ **Safe (Custom files):**
- `/usr/local/hestia/web/js/quick-links.js`
- `/usr/local/hestia/web/css/quick-links.css`
- `/usr/local/hestia/web/images/logo.svg`
- `/usr/local/hestia/web/images/logo-header.svg`
- `/usr/local/hestia/web/images/favicon.png`

⚠️ **May Be Overwritten (Modified HestiaCP files):**
- `/usr/local/hestia/web/templates/includes/app-footer.php`
- `/usr/local/hestia/web/templates/pages/list_db.php`

**Backup Strategy:** Keep copies of modified files and re-apply after updates.

---

## 10. Quick Reference

### Add New Quick Link
1. Edit: `sudo micro /usr/local/hestia/web/js/quick-links.js`
2. Add to `QUICK_LINKS` array
3. Refresh browser

### Change Branding
1. Replace logo files in `/usr/local/hestia/web/images/`
2. Edit footer: `sudo micro /usr/local/hestia/web/templates/includes/app-footer.php`
3. Clear browser cache

### Troubleshooting Quick Links
1. Check browser console (F12) for JavaScript errors
2. Verify files exist:
   ```bash
   ls -la /usr/local/hestia/web/js/quick-links.js
   ls -la /usr/local/hestia/web/css/quick-links.css
   ```
3. Check footer includes the files:
   ```bash
   tail -10 /usr/local/hestia/web/templates/includes/app-footer.php
   ```

---

## 11. Future Enhancements

### Planned Features
- [ ] Add more custom tools to Quick Links
- [ ] Create custom HestiaCP theme
- [ ] Add monitoring dashboard link
- [ ] Integrate with external services

### Maintenance Notes
- **Update Quick Links:** Edit `/usr/local/hestia/web/js/quick-links.js`
- **After HestiaCP Updates:** Re-check `app-footer.php` and `list_db.php` for modifications
- **Backup:** Keep copies of all customized files

---

## 12. Contact & Support

### Resources
- **HestiaCP Docs:** https://hestiacp.com/docs/
- **HestiaCP Forum:** https://forum.hestiacp.com/
- **GitHub:** https://github.com/hestiacp/hestiacp

### Custom Development
- All customizations documented in this file
- WordPress Password Tool: https://amartadey.github.io/wp-password/
- Quick Links feature: Custom implementation

---

**Last Updated:** 2025-12-27
**HestiaCP Version:** 1.9.4
**Server:** server.webgraphicshub.com
