# Complete Server Rebuild Guide
## Development Server Setup with HestiaCP, Cloudflare Tunnel, and WordPress

> **Last Updated:** December 26, 2025  
> **Server IP:** 192.168.29.15  
> **Domains:** server.webgraphicshub.com, dev.webgraphicshub.com, email.webgraphicshub.com

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Create Ubuntu Server on Proxmox](#part-1-create-ubuntu-server-on-proxmox)
3. [Part 2: Initial Server Setup](#part-2-initial-server-setup)
4. [Part 3: Install Docker](#part-3-install-docker)
5. [Part 4: Install HestiaCP](#part-4-install-hestiacp)
6. [Part 5: Install Mailpit](#part-5-install-mailpit)
7. [Part 6: Configure Firewall](#part-6-configure-firewall)
8. [Part 7: Setup Cloudflare Tunnel](#part-7-setup-cloudflare-tunnel)
9. [Part 8: Create Development Sites](#part-8-create-development-sites)
10. [Part 9: Install WordPress via HestiaCP](#part-9-install-wordpress-via-hestiacp)
11. [Part 10: Fix Auto-Start Issues](#part-10-fix-auto-start-issues)
12. [Part 11: Enable SSH for Dev User](#part-11-enable-ssh-for-dev-user)
13. [Part 12: VS Code Remote Setup](#part-12-vs-code-remote-setup)
14. [Troubleshooting](#troubleshooting)
15. [Quick Reference](#quick-reference)

---

## Prerequisites

### What You Need:

- ✅ Proxmox server running
- ✅ Domain name: `webgraphicshub.com` (managed in Cloudflare)
- ✅ Cloudflare account with domain added
- ✅ At least **8GB RAM** and **100GB disk space** for the VM (recommended)
- ✅ Internet connection (behind CGNAT is fine - we use Cloudflare Tunnel)
- ✅ Ubuntu **LTS version only** (22.04 LTS recommended for HestiaCP)

### Network Information:

- **Proxmox Network:** 192.168.29.x
- **Server IP:** Will be assigned via DHCP (e.g., 192.168.29.15)
- **Gateway:** 192.168.29.1 (your router)

---

## Part 1: Create Ubuntu Server on Proxmox

### Step 1.1: Download Ubuntu Server ISO

> **⚠️ IMPORTANT:** HestiaCP only supports **LTS (Long Term Support)** versions of Ubuntu. Always use an LTS version!

1. Open Proxmox web interface: `https://your-proxmox-ip:8006`
2. Click on your Proxmox node name (left sidebar)
3. Click **"local (pve)"** → **"ISO Images"** → **"Download from URL"**
4. Paste this URL for **Ubuntu 22.04 LTS**:
   ```
   https://releases.ubuntu.com/22.04/ubuntu-22.04.5-live-server-amd64.iso
   ```
5. Click **"Query URL"** then **"Download"**
6. Wait for download to complete

**Supported Ubuntu LTS Versions:**
- Ubuntu 22.04 LTS (Recommended)
- Ubuntu 20.04 LTS (Also supported)

### Step 1.2: Create New VM

1. Click **"Create VM"** (top right)

2. **General tab:**
   - Node: (leave as is)
   - VM ID: (leave default or choose, e.g., 100)
   - Name: `webserver` or `dev-server`
   - Click **Next**

3. **OS tab:**
   - ISO image: Select the Ubuntu ISO you downloaded
   - Click **Next**

4. **System tab:**
   - Leave all defaults
   - Click **Next**

5. **Disks tab:**
   - Disk size: `100 GB` (recommended for development server)
   - Click **Next**

6. **CPU tab:**
   - Cores: `2` (minimum, 4 recommended)
   - Click **Next**

7. **Memory tab:**
   - Memory: `8192 MB` (8GB recommended)
   - Click **Next**

8. **Network tab:**
   - Leave defaults
   - Click **Next**

9. **Confirm tab:**
   - ✅ Check **"Start after created"**
   - Click **Finish**

### Step 1.3: Install Ubuntu

1. Click on your new VM in the left sidebar
2. Click **"Console"** (top right)
3. Ubuntu installer will start automatically

4. **Installation Steps:**
   - Language: **English**
   - Keyboard: **Choose yours** (usually English US)
   - Type of install: **Ubuntu Server**
   - Network: Should auto-configure (DHCP)
     - **Note the IP address shown** (e.g., 192.168.29.15)
   - Proxy: **Leave blank**
   - Mirror: **Leave default**
   - Storage: **Use entire disk** (default is fine)
   - Storage configuration: **Done** (accept defaults)
   - Confirm destructive action: **Continue**

5. **Profile Setup:**
   - Your name: `Admin` (or your name)
   - Server name: `server` (or `webserver`)
   - Username: `user` (or your preferred username)
   - Password: `pass` (or your secure password)
   - Confirm password

6. **SSH Setup:**
   - ✅ **Check "Install OpenSSH server"**
   - Do NOT import SSH identity

7. **Featured snaps:**
   - **Don't select anything**
   - Click **Done**

8. **Wait for installation** (5-10 minutes)

9. When you see **"Reboot Now"**:
   - Press **Enter**
   - Wait for reboot

### Step 1.4: Get Your Server's IP Address

After reboot, you'll see a login prompt with the IP address shown above it:

```
Ubuntu 22.04 LTS server tty1

server login: _
```

The IP might be shown like: `192.168.29.15`

**Login:**
- Username: `rahul`
- Password: `Rahul@123`

**Verify IP address:**
```bash
ip addr show
```

Look for an IP like `192.168.29.15` under `ens18` or `eth0`.

**Write down this IP address - you'll need it!**

---

## Part 2: Initial Server Setup

### Step 2.1: SSH into Your Server

From your Windows computer, open **PowerShell** or **Command Prompt**:

```bash
ssh rahul@192.168.29.15
```

(Replace `192.168.29.15` with your actual server IP)

Enter password when prompted.

### Step 2.2: Update System

```bash
# Update package list and upgrade all packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install curl wget git nano ufw net-tools -y
```

### Step 2.3: Set Timezone (Optional)

```bash
# Set timezone to India
sudo timedatectl set-timezone Asia/Kolkata

# Verify
timedatectl
```

---

## Part 3: Install Docker

Docker makes it easy to run containerized applications like Mailpit.

```bash
# Download Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh

# Run the installation script
sudo sh get-docker.sh

# Add your user to docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Log out and back in for group changes to take effect
exit
```

**SSH back in:**
```bash
ssh rahul@192.168.29.15
```

**Test Docker:**
```bash
docker --version
docker-compose --version
```

You should see version numbers for both.

---

## Part 4: Install HestiaCP

HestiaCP is a free web hosting control panel that makes server management easy.

### Step 4.1: Download and Run Installer

```bash
# Download HestiaCP installer
wget https://raw.githubusercontent.com/hestiacp/hestiacp/release/install/hst-install.sh

# Run installer
sudo bash hst-install.sh
```

### Step 4.2: Answer Installation Questions

During installation, you'll be asked:

1. **Email address:** Enter your email (e.g., `admin@webgraphicshub.com`)
2. **FQDN (hostname):** Enter `server.webgraphicshub.com`
3. **Everything else:** Press **Enter** to accept defaults

### Step 4.3: Wait for Installation

Installation takes **10-15 minutes**. Get a coffee! ☕

### Step 4.4: Save Your Credentials

At the end, you'll see:

```
==================================================================
 _   _           _   _        ____ ____
| | | | ___  ___| |_(_) __ _ / ___|  _ \
| |_| |/ _ \/ __| __| |/ _` | |   | |_) |
|  _  |  __/\__ \ |_| | (_| | |___|  __/
|_| |_|\___||___/\__|_|\__,_|\____|_|

Congratulations!

You have successfully installed Hestia Control Panel.

    https://192.168.29.15:8083
    username: admin
    password: XXXXXXXXXX

==================================================================
```

**⚠️ IMPORTANT: Copy and save this password immediately!**

You can now access HestiaCP at:
- Local: `https://192.168.29.15:8083`
- Username: `admin`
- Password: (the one shown above)

---

## Part 5: Install Mailpit

Mailpit is an email testing tool that catches emails for development.

### Step 5.1: Create Mailpit Directory and Config

```bash
# Create directory for Mailpit
mkdir -p ~/mailpit
cd ~/mailpit

# Create docker-compose file
nano docker-compose.yml
```

### Step 5.2: Paste This Configuration

```yaml
version: '3'
services:
  mailpit:
    image: axllent/mailpit
    container_name: mailpit
    restart: unless-stopped
    ports:
      - "8025:8025"  # Web interface
      - "1025:1025"  # SMTP server
    environment:
      MP_MAX_MESSAGES: 5000
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1
```

**Save the file:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

### Step 5.3: Start Mailpit

```bash
# Start Mailpit
docker-compose up -d

# Verify it's running
docker ps
```

You should see a container named `mailpit` running.

**Test Mailpit locally:**
```bash
curl http://localhost:8025
```

You should see HTML output (the Mailpit web interface).

---

## Part 6: Configure Firewall

### Step 6.1: Install and Configure UFW

```bash
# Install UFW (if not already installed)
sudo apt install ufw -y

# Allow SSH (IMPORTANT - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow HestiaCP
sudo ufw allow 8083/tcp

# Allow Mailpit web interface
sudo ufw allow 8025/tcp

# Allow FTP
sudo ufw allow 21/tcp
sudo ufw allow 12000:12100/tcp

# Enable firewall
sudo ufw enable
```

Type `y` when prompted.

### Step 6.2: Verify Firewall Status

```bash
sudo ufw status
```

You should see:

```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
8083/tcp                   ALLOW       Anywhere
8025/tcp                   ALLOW       Anywhere
21/tcp                     ALLOW       Anywhere
12000:12100/tcp            ALLOW       Anywhere
...
```

---

## Part 7: Setup Cloudflare Tunnel

Cloudflare Tunnel allows you to expose your server to the internet without port forwarding (perfect for CGNAT).

### Step 7.1: Install Cloudflared

```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install it
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify installation
cloudflared --version
```

### Step 7.2: Login to Cloudflare

```bash
cloudflared tunnel login
```

This will show you a URL like:

```
Please open the following URL and log in with your Cloudflare account:

https://dash.cloudflare.com/argotunnel?callback=...
```

**Copy the entire URL** and paste it in your browser.

1. Login to Cloudflare
2. Select your domain: **webgraphicshub.com**
3. Click **"Authorize"**
4. You'll see **"You may close this window"**

### Step 7.3: Create Tunnel

```bash
# Create a tunnel named "webserver"
cloudflared tunnel create webserver
```

You'll see output like:

```
Tunnel credentials written to /root/.cloudflared/2e0854bd-0c92-4b25-9f5a-b3d07ded8b7d.json
Created tunnel webserver with id: 2e0854bd-0c92-4b25-9f5a-b3d07ded8b7d
```

**⚠️ IMPORTANT: Copy and save the Tunnel ID** (the long string like `2e0854bd-0c92-4b25-9f5a-b3d07ded8b7d`)

### Step 7.4: Create Tunnel Configuration

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared

# Create config file
sudo nano /etc/cloudflared/config.yml
```

**Paste this configuration** (replace `YOUR-TUNNEL-ID` with your actual Tunnel ID):

```yaml
tunnel: YOUR-TUNNEL-ID
credentials-file: /root/.cloudflared/YOUR-TUNNEL-ID.json

ingress:
  # Main server management (HestiaCP)
  - hostname: server.webgraphicshub.com
    service: https://192.168.29.15:8083
    originRequest:
      noTLSVerify: true

  # Mailpit
  - hostname: email.webgraphicshub.com
    service: http://localhost:8025

  # Development sites
  - hostname: dev.webgraphicshub.com
    service: http://192.168.29.15:80

  # Catch-all rule (required)
  - service: http_status:404
```

**⚠️ IMPORTANT:** Replace `YOUR-TUNNEL-ID` with your actual Tunnel ID in **both places**!

**Example:**
```yaml
tunnel: 2e0854bd-0c92-4b25-9f5a-b3d07ded8b7d
credentials-file: /root/.cloudflared/2e0854bd-0c92-4b25-9f5a-b3d07ded8b7d.json
```

**Save the file:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

### Step 7.5: Copy Credentials to Root

```bash
# Copy credentials file to root's directory
sudo mkdir -p /root/.cloudflared/
sudo cp ~/.cloudflared/*.json /root/.cloudflared/
sudo cp ~/.cloudflared/cert.pem /root/.cloudflared/

# Verify files are copied
sudo ls -la /root/.cloudflared/
```

### Step 7.6: Setup DNS in Cloudflare

```bash
# Route DNS for server.webgraphicshub.com
cloudflared tunnel route dns webserver server.webgraphicshub.com

# Route DNS for dev.webgraphicshub.com
cloudflared tunnel route dns webserver dev.webgraphicshub.com

# Route DNS for email.webgraphicshub.com
cloudflared tunnel route dns webserver email.webgraphicshub.com
```

Each command should respond with:
```
Created CNAME record for [domain]
```

### Step 7.7: Install Tunnel as a Service

```bash
# Install the service
sudo cloudflared service install

# Start the service
sudo systemctl start cloudflared

# Enable it to start on boot
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared
```

You should see **"active (running)"** in green.

Press `q` to exit the status view.

---

## Part 8: Create Development Sites

### Step 8.1: Create Directory Structure

```bash
# Create directory for dev site
mkdir -p ~/dev-site

# Create a simple test page
echo "<h1>My Development Site</h1><p>This is accessible at dev.webgraphicshub.com</p>" > ~/dev-site/index.html
```

### Step 8.2: Create Docker Compose for Dev Site

```bash
# Create directory for dev server config
mkdir -p ~/dev-server
cd ~/dev-server

# Create docker-compose file
nano docker-compose.yml
```

**Paste this configuration:**

```yaml
version: '3'
services:
  dev-site:
    image: nginx:alpine
    container_name: dev-site
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - /home/rahul/dev-site:/usr/share/nginx/html
```

**⚠️ NOTE:** If your username is different from `rahul`, change `/home/rahul/` to `/home/YOUR-USERNAME/`

**Save the file:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

### Step 8.3: Start Dev Site

```bash
# Start the dev site
docker-compose up -d

# Verify it's running
docker ps
```

You should see a container named `dev-site` running.

---

## Part 9: Install WordPress via HestiaCP

### Step 9.1: Access HestiaCP

Wait **2-3 minutes** for DNS to propagate, then open your browser and go to:

```
https://server.webgraphicshub.com
```

**Login:**
- Username: `admin`
- Password: (the password from Part 4)

### Step 9.2: Create a New User for Development

1. Click **"USER"** in the top menu
2. Click **"+ Add User"** (green button)
3. Fill in:
   - **Username:** `dev`
   - **Password:** Create a strong password (save it!)
   - **Email:** `dev@webgraphicshub.com`
   - **Package:** default
   - **Name:** Development User
4. Click **"Save"**

### Step 9.3: Add Domain

1. **Logout** from admin account
2. **Login** as `dev` user (username: `dev`, password: the one you just created)
3. Click **"WEB"** in the top menu
4. Click **"+ Add Web Domain"** (green button)
5. Fill in:
   - **Domain:** `dev.webgraphicshub.com`
   - Leave other settings as default
6. Click **"Save"**

### Step 9.4: Install WordPress

1. Still in the **"WEB"** section, find `dev.webgraphicshub.com` in the list
2. Click the **pencil icon** (edit) next to it
3. Scroll down to **"Quick Install App"** section
4. Select **"WordPress"** from the dropdown
5. Click **"Install"**
6. Wait **1-2 minutes** for installation to complete

### Step 9.5: Create Database for WordPress

HestiaCP should have created a database automatically, but let's verify:

1. Click **"DB"** in the top menu
2. You should see a database listed

If not, create one:
1. Click **"+ Add Database"** (green button)
2. Fill in:
   - **Database:** `devwp`
   - **Username:** (auto-filled)
   - **Password:** Click generate or create your own
   - **Type:** MySQL
3. Click **"Save"**
4. **⚠️ IMPORTANT: Copy and save the database name, username, and password!**

### Step 9.6: Update Cloudflare Tunnel (Stop Docker Dev Site)

Since we're now using HestiaCP to serve the website, we don't need the Docker dev site anymore:

```bash
# Stop the docker dev site
cd ~/dev-server
docker-compose down
```

The Cloudflare tunnel is already configured to point to `http://192.168.29.15:80`, which is where HestiaCP's Nginx serves websites.

### Step 9.7: Access WordPress

Wait **1-2 minutes**, then visit:

```
https://dev.webgraphicshub.com
```

You should see your WordPress site!

**WordPress Admin:**
```
https://dev.webgraphicshub.com/wp-admin
```

---

## Part 10: Fix Auto-Start Issues

To prevent services from failing to start after a reboot (due to network not being ready), we need to configure systemd overrides.

### Step 10.1: Fix Nginx Auto-Start

```bash
# Create systemd override directory for nginx
sudo mkdir -p /etc/systemd/system/nginx.service.d/

# Create override configuration
sudo nano /etc/systemd/system/nginx.service.d/override.conf
```

**Paste this:**

```ini
[Unit]
After=network-online.target
Wants=network-online.target

[Service]
Restart=on-failure
RestartSec=5s
```

**Save the file** (Ctrl+X, Y, Enter)

### Step 10.2: Fix Apache Auto-Start

```bash
# Create systemd override directory for apache
sudo mkdir -p /etc/systemd/system/apache2.service.d/

# Create override configuration
sudo nano /etc/systemd/system/apache2.service.d/override.conf
```

**Paste this:**

```ini
[Unit]
After=network-online.target
Wants=network-online.target

[Service]
Restart=on-failure
RestartSec=5s
```

**Save the file** (Ctrl+X, Y, Enter)

### Step 10.3: Fix HestiaCP Auto-Start

```bash
# Create systemd override directory for hestia
sudo mkdir -p /etc/systemd/system/hestia.service.d/

# Create override configuration
sudo nano /etc/systemd/system/hestia.service.d/override.conf
```

**Paste this:**

```ini
[Unit]
After=network-online.target
Wants=network-online.target

[Service]
Restart=on-failure
RestartSec=5s
```

**Save the file** (Ctrl+X, Y, Enter)

### Step 10.4: Reload Systemd

```bash
# Reload systemd to apply changes
sudo systemctl daemon-reload

# Restart all services to verify they work
sudo systemctl restart nginx
sudo systemctl restart apache2
sudo systemctl restart hestia
sudo systemctl restart cloudflared

# Check status of all services
sudo systemctl status nginx
sudo systemctl status apache2
sudo systemctl status hestia
sudo systemctl status cloudflared
```

All should show **"active (running)"** in green.

---

## Part 11: Enable SSH for Dev User

By default, HestiaCP creates users with SFTP-only access. To use VS Code Remote-SSH, we need to enable full SSH access.

### Step 11.1: Change Dev User's Shell

```bash
# Change dev user's shell from restricted to bash
sudo chsh -s /bin/bash dev

# Verify the change
sudo grep "^dev:" /etc/passwd
```

The output should show `/bin/bash` at the end.

### Step 11.2: Test SSH Access

```bash
# Test SSH as dev user
ssh dev@localhost
```

Enter the `dev` user password. You should get a bash prompt.

Type `exit` to return to your `rahul` user.

---

## Part 12: VS Code Remote Setup

### Step 12.1: Install VS Code Extensions

On your **Windows computer**, open VS Code and install these extensions:

1. **Remote - SSH** (by Microsoft)
2. **Remote - SSH: Editing Configuration Files** (by Microsoft)
3. **Remote Explorer** (by Microsoft)

**Quick way:** Search for and install **"Remote Development"** extension pack - it includes all three!

### Step 12.2: Add SSH Connection

1. Press `F1` or `Ctrl+Shift+P`
2. Type: `Remote-SSH: Add New SSH Host`
3. Enter: `ssh dev@server.webgraphicshub.com`
4. Select the SSH config file (usually first option)

### Step 12.3: Connect to Server

1. Press `F1` or `Ctrl+Shift+P`
2. Type: `Remote-SSH: Connect to Host`
3. Select `dev@server.webgraphicshub.com`
4. Enter the `dev` user password when prompted
5. Select **"Linux"** as the platform

### Step 12.4: Open Project Folder

1. Once connected, click **"Open Folder"**
2. Navigate to: `/home/dev/web/dev.webgraphicshub.com/public_html/`
3. Click **OK**

You can now edit your WordPress files directly in VS Code!

### Step 12.5: (Optional) Setup SSH Keys for Passwordless Login

On your **Windows computer**, open PowerShell:

```powershell
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default location
# Press Enter twice to skip passphrase (or set one)

# Copy the public key to the server
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh dev@server.webgraphicshub.com "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Enter the `dev` user password one last time. After this, VS Code will connect without asking for a password!

---

## Troubleshooting

### Issue: 502 Bad Gateway After Reboot

**Cause:** Services didn't start automatically because the network wasn't ready.

**Solution:**

```bash
# Check which services are down
sudo systemctl status nginx
sudo systemctl status apache2
sudo systemctl status hestia
sudo systemctl status cloudflared

# Start any failed services
sudo systemctl start nginx
sudo systemctl start apache2
sudo systemctl start hestia
sudo systemctl restart cloudflared

# Wait 30 seconds, then test websites
```

If you've applied the fixes in Part 10, this shouldn't happen again.

---

### Issue: Can't Connect via SSH

**Cause:** Firewall blocking port 22 or SSH service not running.

**Solution:**

```bash
# Check if SSH is running
sudo systemctl status ssh

# If not running, start it
sudo systemctl start ssh

# Make sure firewall allows SSH
sudo ufw allow 22/tcp
sudo ufw reload
```

---

### Issue: Cloudflare Tunnel Not Working

**Cause:** Tunnel service not running or configuration error.

**Solution:**

```bash
# Check tunnel status
sudo systemctl status cloudflared

# View detailed logs
sudo journalctl -u cloudflared -n 50 --no-pager

# Restart tunnel
sudo systemctl restart cloudflared

# Verify config file
sudo cat /etc/cloudflared/config.yml
```

Make sure the Tunnel ID in the config matches your actual tunnel ID.

---

### Issue: WordPress Site Not Loading

**Cause:** Apache or Nginx not running, or file permissions issue.

**Solution:**

```bash
# Check if Apache and Nginx are running
sudo systemctl status apache2
sudo systemctl status nginx

# Check what's listening on port 80
sudo netstat -tlnp | grep :80

# Fix file permissions
sudo chown -R dev:dev /home/dev/web/dev.webgraphicshub.com/public_html/
sudo chmod -R 755 /home/dev/web/dev.webgraphicshub.com/public_html/
```

---

### Issue: Mailpit Not Accessible

**Cause:** Docker container not running.

**Solution:**

```bash
# Check if Mailpit is running
docker ps

# If not running, start it
cd ~/mailpit
docker-compose up -d

# Check logs
docker logs mailpit
```

---

## Quick Reference

### Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| HestiaCP | https://server.webgraphicshub.com | Server management panel |
| WordPress | https://dev.webgraphicshub.com | Development website |
| WordPress Admin | https://dev.webgraphicshub.com/wp-admin | WordPress dashboard |
| Mailpit | https://email.webgraphicshub.com | Email testing interface |

### Important Credentials

| Service | Username | Password Location |
|---------|----------|-------------------|
| HestiaCP Admin | admin | Shown during HestiaCP installation |
| HestiaCP Dev User | dev | Set when creating dev user |
| SSH (Admin) | rahul | Rahul@123 (or what you set) |
| SSH (Dev) | dev | Same as HestiaCP dev user password |
| MySQL Root | root | `/usr/local/hestia/conf/mysql.conf` |

### Important File Locations

| Description | Path |
|-------------|------|
| WordPress Files | `/home/dev/web/dev.webgraphicshub.com/public_html/` |
| WordPress Config | `/home/dev/web/dev.webgraphicshub.com/public_html/wp-config.php` |
| Nginx Config | `/etc/nginx/nginx.conf` |
| Apache Config | `/etc/apache2/apache2.conf` |
| HestiaCP Config | `/usr/local/hestia/conf/` |
| Cloudflare Tunnel Config | `/etc/cloudflared/config.yml` |
| Mailpit Config | `~/mailpit/docker-compose.yml` |

### Common Commands

#### Check Service Status
```bash
sudo systemctl status nginx
sudo systemctl status apache2
sudo systemctl status hestia
sudo systemctl status cloudflared
docker ps
```

#### Restart Services
```bash
sudo systemctl restart nginx
sudo systemctl restart apache2
sudo systemctl restart hestia
sudo systemctl restart cloudflared
cd ~/mailpit && docker-compose restart
```

#### View Logs
```bash
# Cloudflare Tunnel logs
sudo journalctl -u cloudflared -n 50 --no-pager

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Apache logs
sudo tail -f /var/log/apache2/error.log

# Docker logs
docker logs mailpit
docker logs dev-site
```

#### Check What's Listening on Ports
```bash
sudo netstat -tlnp | grep :80    # HTTP
sudo netstat -tlnp | grep :443   # HTTPS
sudo netstat -tlnp | grep :8083  # HestiaCP
sudo netstat -tlnp | grep :8025  # Mailpit
```

#### File Permissions
```bash
# Fix WordPress file permissions
sudo chown -R dev:www-data /home/dev/web/dev.webgraphicshub.com/public_html/
sudo find /home/dev/web/dev.webgraphicshub.com/public_html/ -type d -exec chmod 755 {} \;
sudo find /home/dev/web/dev.webgraphicshub.com/public_html/ -type f -exec chmod 644 {} \;
```

---

## Network Information

### Server Details

- **Server IP:** 192.168.29.15 (may change if DHCP)
- **Gateway:** 192.168.29.1
- **DNS:** Cloudflare (1.1.1.1, 1.0.0.1)

### Port Mapping

| Port | Service | Access |
|------|---------|--------|
| 22 | SSH | Internal only |
| 80 | HTTP (Nginx) | Via Cloudflare Tunnel |
| 443 | HTTPS (Nginx) | Via Cloudflare Tunnel |
| 1025 | SMTP (Mailpit) | Internal only |
| 8025 | Mailpit Web | Via Cloudflare Tunnel |
| 8080 | Apache | Internal only |
| 8083 | HestiaCP | Via Cloudflare Tunnel |
| 8443 | Apache SSL | Internal only |

---

## Backup Recommendations

### What to Backup

1. **HestiaCP Backup:**
   ```bash
   # HestiaCP has built-in backup
   # Go to: HestiaCP → Backup → Configure automatic backups
   ```

2. **Cloudflare Tunnel Config:**
   ```bash
   sudo cp /etc/cloudflared/config.yml ~/cloudflared-config-backup.yml
   sudo cp /root/.cloudflared/*.json ~/
   ```

3. **WordPress Files:**
   ```bash
   tar -czf wordpress-backup.tar.gz /home/dev/web/dev.webgraphicshub.com/public_html/
   ```

4. **MySQL Databases:**
   ```bash
   # Get MySQL root password
   sudo cat /usr/local/hestia/conf/mysql.conf
   
   # Backup all databases
   mysqldump -u root -p --all-databases > all-databases-backup.sql
   ```

### Backup Script (Optional)

Create a backup script:

```bash
nano ~/backup.sh
```

Paste this:

```bash
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR

# Backup WordPress
tar -czf $BACKUP_DIR/wordpress-$DATE.tar.gz /home/dev/web/dev.webgraphicshub.com/public_html/

# Backup Cloudflare config
sudo cp /etc/cloudflared/config.yml $BACKUP_DIR/cloudflared-config-$DATE.yml

echo "Backup completed: $BACKUP_DIR"
```

Make it executable:

```bash
chmod +x ~/backup.sh
```

Run it:

```bash
~/backup.sh
```

---

## Final Checklist

After completing this guide, verify everything works:

- [ ] Can access HestiaCP: https://server.webgraphicshub.com
- [ ] Can access WordPress: https://dev.webgraphicshub.com
- [ ] Can access Mailpit: https://email.webgraphicshub.com
- [ ] Can SSH as `rahul` user: `ssh rahul@server.webgraphicshub.com`
- [ ] Can SSH as `dev` user: `ssh dev@server.webgraphicshub.com`
- [ ] Can connect via VS Code Remote-SSH
- [ ] All services start automatically after reboot
- [ ] Firewall is enabled and configured
- [ ] Cloudflare Tunnel is running

---

## Support & Resources

### Official Documentation

- **HestiaCP:** https://docs.hestiacp.com/
- **Cloudflare Tunnel:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Mailpit:** https://github.com/axllent/mailpit
- **WordPress:** https://wordpress.org/support/

### Useful Commands for Monitoring

```bash
# System resources
htop

# Disk usage
df -h

# Check all running services
systemctl list-units --type=service --state=running

# Check network connections
sudo netstat -tulpn

# Check Docker containers
docker ps -a

# Check system logs
sudo journalctl -xe
```

---

## Notes

- This guide assumes you're using **Ubuntu 22.04 LTS**
- Server IP `192.168.29.15` is used as an example - yours may be different
- All passwords should be changed to secure values
- Keep this guide updated if you make configuration changes
- Regular backups are essential!

---

**Last Updated:** December 26, 2025  
**Version:** 1.0  
**Author:** Server Setup Guide

---

## Changelog

### Version 1.0 (December 26, 2025)
- Initial guide creation
- Complete server setup from scratch
- HestiaCP installation
- Cloudflare Tunnel configuration
- WordPress installation
- VS Code Remote-SSH setup
- Auto-start fixes for all services
