# Server Context: WebGraphicsHub Development Environment

## 1. Infrastructure & Network
- **Host Platform:** Proxmox VM
- **OS:** Ubuntu 22.04 LTS
- **Resources:** 2 Cores, 8GB RAM, 100GB Disk
- **Local IP:** `192.168.29.15` (Gateway: `192.168.29.1`)
- **Timezone:** Asia/Kolkata
- **Network Access:** Cloudflare Tunnel (No port forwarding/CGNAT)

## 2. Domain Mapping
| Domain | Service | Port/Target |
|--------|---------|-------------|
| `webgraphicshub.com` | Root Domain | Managed in Cloudflare |
| `server.webgraphicshub.com` | HestiaCP Panel | `https://192.168.29.15:8083` |
| `dev.webgraphicshub.com` | WordPress Dev | `http://192.168.29.15:80` |
| `email.webgraphicshub.com` | Mailpit | `http://localhost:8025` |

## 3. Software Stack
- **Control Panel:** HestiaCP
- **Web Server:** Nginx (Proxy) + Apache (Backend)
- **Database:** MySQL
- **PHP:** 8.3 (FPM)
- **Containerization:** Docker & Docker Compose
- **Mail Testing:** Mailpit (Docker container)

## 4. Cloudflare Tunnel Configuration
- **Config Path:** `/etc/cloudflared/config.yml`
- **Service Name:** `webserver`
- **Ingress Rules:**
  - `server.` -> `https://192.168.29.15:8083` (`noTLSVerify: true`)
  - `email.` -> `http://localhost:8025`
  - `dev.` -> `http://192.168.29.15:80`
  - Catch-all -> `404`

## 5. User Roles & Access
- **System Admin (Root/Sudo):** `rahul`
- **Hestia Admin:** `admin`
- **Dev User:** `dev`
  - **Shell:** `/bin/bash` (Enabled for VS Code Remote SSH)
  - **Home:** `/home/dev/`
  - **Web Root:** `/home/dev/web/dev.webgraphicshub.com/public_html/`

## 6. Critical Customizations (Non-Standard)
### Systemd Auto-Start Fixes
- **Affected Services:** `nginx`, `apache2`, `hestia`
- **Override Location:** `/etc/systemd/system/[service].service.d/override.conf`
- **Logic:** `After=network-online.target` and `Restart=on-failure` to prevent boot failures due to network lag.

### FTP & Firewall
- **Firewall (UFW):** Ports 22, 80, 443, 8083, 8025, 21, 12000:12100 open.
- **VSFTPD Hack:** `pasv_address=192.168.29.15` hardcoded in `/etc/vsftpd.conf`.
- **Note:** File is **immutable** (`chattr +i`). Must use `chattr -i` before editing.

### Upload Limits (Increased to 5GB)
- **Nginx:** `client_max_body_size` in `/etc/nginx/nginx.conf`
- **PHP:** `upload_max_filesize`, `post_max_size` in `/etc/php/8.3/fpm/php.ini`
- **FileGator:** `configuration.php`

### UI/UX
- **Pluginable:** Installed in `/etc/hestiacp/hooks`.
- **Branding:** Custom Footer JS redirects generic phpMyAdmin links to the `dev` subdomain.

## 7. Key File Paths
- **Cloudflare Config:** `/etc/cloudflared/config.yml`
- **Mailpit Compose:** `~/mailpit/docker-compose.yml`
- **Nginx Config:** `/etc/nginx/nginx.conf`
- **Apache Config:** `/etc/apache2/apache2.conf`
- **MySQL Conf:** `/usr/local/hestia/conf/mysql.conf` (Root pass here)
- **VSFTPD Conf:** `/etc/vsftpd.conf`
