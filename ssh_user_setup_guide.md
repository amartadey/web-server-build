# SSH User Setup Guide for VS Code Development

## Overview
This guide explains how to create a dedicated Linux user for VS Code development with proper permissions, isolated from other system users and groups.

## Use Case
- **Scenario**: Multiple developers need to code on a shared Linux server using VS Code Remote SSH
- **Goal**: Create isolated user accounts with access only to specific project directories
- **Security**: Each developer has their own user account, separate from system admin accounts

---

## Prerequisites
- Linux server (Ubuntu/Debian-based)
- SSH access with sudo privileges
- VS Code installed on Windows PC
- Remote-SSH extension installed in VS Code

---

## Part 1: Server Setup (Linux)

### Step 1: Create the New User

Connect to your server as a user with sudo privileges (e.g., `rahul`):

```bash
ssh your_admin_user@server_ip
```

Create the new user with a home directory and bash shell:

```bash
sudo useradd -m -s /bin/bash username
```

**Example:**
```bash
sudo useradd -m -s /bin/bash amar
```

**What this does:**
- `-m` = Creates home directory at `/home/username`
- `-s /bin/bash` = Sets bash as default shell (required for VS Code)

### Step 2: Set a Password

```bash
sudo passwd username
```

Enter a secure password when prompted (you'll need this for VS Code login).

### Step 3: Verify User Creation

```bash
id username
```

**Expected output:**
```
uid=1005(username) gid=1005(username) groups=1005(username)
```

---

## Part 2: Group and Permissions Setup

### Step 4: Create a Dedicated Development Group

Instead of adding users to existing groups (like `dev`), create a dedicated group for collaboration:

```bash
sudo groupadd webdev
```

### Step 5: Add User to the Development Group

```bash
sudo usermod -aG webdev username
```

Verify group membership:

```bash
groups username
```

**Expected output:**
```
username : username webdev
```

### Step 6: Configure Directory Permissions

Assuming your project directory is `/home/dev/web/dev.webgraphicshub.com/public_html/dev`:

**Change group ownership of the project directory:**

```bash
sudo chgrp -R webdev /home/dev/web/dev.webgraphicshub.com/public_html/dev
```

**Set group write permissions:**

```bash
sudo chmod -R g+w /home/dev/web/dev.webgraphicshub.com/public_html/dev
```

### Step 7: Fix Directory Traversal Permissions

Users need execute (`x`) permission on parent directories to access subdirectories:

```bash
sudo chmod g+rx /home/dev
sudo chmod g+rx /home/dev/web
sudo chmod g+rx /home/dev/web/dev.webgraphicshub.com
sudo chmod g+rx /home/dev/web/dev.webgraphicshub.com/public_html
```

**Change group ownership of parent directories:**

```bash
sudo chgrp webdev /home/dev
sudo chgrp webdev /home/dev/web
sudo chgrp webdev /home/dev/web/dev.webgraphicshub.com
sudo chgrp webdev /home/dev/web/dev.webgraphicshub.com/public_html
```

### Step 8: Add ACL Permissions (If Needed)

If directories have ACLs (indicated by `+` in `ls -la` output like `drwxr-x--x+`), add ACL permissions:

```bash
sudo setfacl -m g:webdev:rx /home/dev
sudo setfacl -m g:webdev:rx /home/dev/web
sudo setfacl -m g:webdev:rx /home/dev/web/dev.webgraphicshub.com
sudo setfacl -m g:webdev:rx /home/dev/web/dev.webgraphicshub.com/public_html
```

**Verify ACL:**

```bash
getfacl /home/dev
```

**Expected output should include:**
```
group:webdev:r-x
```

### Step 9: Create SSH Directory

```bash
sudo mkdir -p /home/username/.ssh
sudo chown username:username /home/username/.ssh
sudo chmod 700 /home/username/.ssh
```

### Step 10: Generate SSH Key Pair (Optional)

If you want to use SSH key authentication instead of passwords:

```bash
sudo -u username ssh-keygen -t ed25519 -C "username@server" -f /home/username/.ssh/id_ed25519 -N ""
```

**Copy public key to authorized_keys:**

```bash
sudo -u username cp /home/username/.ssh/id_ed25519.pub /home/username/.ssh/authorized_keys
sudo chmod 600 /home/username/.ssh/authorized_keys
```

**Display private key** (to copy to Windows PC):

```bash
sudo cat /home/username/.ssh/id_ed25519
```

---

## Part 3: Windows PC Setup

### Step 11: Create SSH Directory on Windows

Open PowerShell and run:

```powershell
mkdir $env:USERPROFILE\.ssh -Force
```

### Step 12: Save SSH Key (If Using Key Authentication)

**Option A: Manual Copy**

1. Open Notepad:
   ```powershell
   notepad $env:USERPROFILE\.ssh\username_key
   ```

2. Paste the entire private key (from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`)

3. Save and close

4. Remove `.txt` extension if Notepad added it:
   ```powershell
   Rename-Item $env:USERPROFILE\.ssh\username_key.txt $env:USERPROFILE\.ssh\username_key
   ```

**Option B: Direct Copy via SCP** (if permissions allow)

```powershell
scp admin_user@server_ip:/home/username/.ssh/id_ed25519 $env:USERPROFILE\.ssh\username_key
```

**Set proper permissions:**

```powershell
icacls $env:USERPROFILE\.ssh\username_key /inheritance:r
icacls $env:USERPROFILE\.ssh\username_key /grant "$env:USERNAME`:R"
```

### Step 13: Configure SSH Config File

Open the SSH config file:

```powershell
notepad $env:USERPROFILE\.ssh\config
```

Add this configuration:

```
Host server-username
    HostName 192.168.29.15
    User username
    IdentityFile C:\Users\YourWindowsUser\.ssh\username_key
```

**For password authentication, omit the `IdentityFile` line:**

```
Host server-username
    HostName 192.168.29.15
    User username
```

Save and close.

### Step 14: Test SSH Connection

```powershell
ssh server-username
```

**Expected result:**
- If using password: Enter the password you set
- If using key: Automatic login
- You should see: `username@server:~$`

Test directory access:

```bash
cd /home/dev/web/dev.webgraphicshub.com/public_html/dev
ls -la
```

If successful, type `exit` to disconnect.

---

## Part 4: VS Code Setup

### Step 15: Install Remote-SSH Extension

1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search for "Remote - SSH"
4. Install the extension by Microsoft

### Step 16: Connect to Server

1. Press `F1` (or `Ctrl+Shift+P`)
2. Type: `Remote-SSH: Connect to Host`
3. Select: `server-username` (from your SSH config)
4. Enter password (if using password authentication)
5. Wait for VS Code to install server components

### Step 17: Open Project Directory

1. Click "Open Folder" in VS Code
2. Type: `/home/dev/web/dev.webgraphicshub.com/public_html/dev`
3. Click "OK"

### Step 18: Test Editing

1. Open a file (e.g., `test.html`)
2. Make a change
3. Save (`Ctrl+S`)
4. Verify the file saves without permission errors

---

## Troubleshooting

### Permission Denied When Accessing Directories

**Symptom:**
```bash
cd /home/dev
ls: cannot open directory '.': Permission denied
```

**Solution:**
1. Check group membership:
   ```bash
   groups username
   ```

2. Ensure user is in the correct group (e.g., `webdev`)

3. Check directory permissions:
   ```bash
   ls -la /home/dev
   ```

4. Add ACL permissions if needed:
   ```bash
   sudo setfacl -m g:webdev:rx /home/dev
   ```

### Cannot Save Files in VS Code

**Symptom:**
Files open but cannot be saved.

**Solution:**
1. Check file ownership:
   ```bash
   ls -la /path/to/file
   ```

2. Ensure group has write permissions:
   ```bash
   sudo chmod g+w /path/to/file
   ```

3. Ensure directory has group write permissions:
   ```bash
   sudo chmod -R g+w /path/to/directory
   ```

### SSH Key "Invalid Format" Error

**Symptom:**
```
Load key "C:\\Users\\...\\key": invalid format
```

**Solution:**
The key file has incorrect encoding. Re-copy the key ensuring:
- No extra characters or line breaks
- Saved with ASCII/UTF-8 encoding (not UTF-16)
- No `.txt` extension

### User Can See Other Users' Home Directories

**Symptom:**
When opening `/home` in VS Code, all user directories are visible.

**Solution:**
This is normal Linux behavior. Users can see directory names but cannot access contents without proper permissions. To verify:

```bash
ls /home/other_user
# Should show: Permission denied
```

---

## Security Best Practices

### 1. Use SSH Keys Instead of Passwords
- More secure than passwords
- Cannot be brute-forced
- Easy to revoke individual access

### 2. Restrict SSH Access by IP (Optional)

In `/home/username/.ssh/authorized_keys`, prefix the key with IP restriction:

```
from="192.168.29.100" ssh-ed25519 AAAAC3... username@server
```

### 3. Use Separate Groups for Different Projects

Don't add users to the main `dev` group. Create project-specific groups:

```bash
sudo groupadd project1_dev
sudo groupadd project2_dev
```

### 4. Regular Audit of User Access

Check who has access to what:

```bash
getfacl /path/to/directory
ls -la /path/to/directory
```

### 5. Remove Users When They Leave

```bash
# Remove user from group
sudo gpasswd -d username groupname

# Delete user account
sudo userdel -r username
```

---

## Quick Reference Commands

### Create User
```bash
sudo useradd -m -s /bin/bash username
sudo passwd username
```

### Create Group and Add User
```bash
sudo groupadd webdev
sudo usermod -aG webdev username
```

### Set Directory Permissions
```bash
sudo chgrp -R webdev /path/to/directory
sudo chmod -R g+w /path/to/directory
```

### Add ACL Permissions
```bash
sudo setfacl -m g:webdev:rx /path/to/directory
```

### Verify Access
```bash
groups username
getfacl /path/to/directory
ls -la /path/to/directory
```

### Remove User from Group
```bash
sudo gpasswd -d username groupname
```

### Delete User
```bash
sudo userdel -r username
```

---

## Example: Adding a Second Developer

Let's say you want to add a developer named "john":

**On the server:**

```bash
# Create user
sudo useradd -m -s /bin/bash john
sudo passwd john

# Add to webdev group
sudo usermod -aG webdev john

# Verify
groups john
```

**On John's Windows PC:**

```powershell
# Edit SSH config
notepad $env:USERPROFILE\.ssh\config
```

Add:
```
Host server-john
    HostName 192.168.29.15
    User john
```

**In VS Code:**
1. Connect to `server-john`
2. Open folder: `/home/dev/web/dev.webgraphicshub.com/public_html/dev`
3. Start coding!

---

## Collaboration with VS Code Live Share

Once multiple developers are set up, they can collaborate in real-time:

1. **Developer A** starts a Live Share session in VS Code
2. **Developer A** shares the Live Share link (via Slack/Teams/etc.)
3. **Developer B** clicks the link and joins the session
4. Both can see each other's cursors and edit files simultaneously
5. Changes are saved instantly on the server

**No dependency on any single developer being online!**

---

## Summary

This guide covered:
- ✅ Creating isolated user accounts for development
- ✅ Setting up group-based permissions
- ✅ Configuring ACLs for directory access
- ✅ Windows SSH setup for VS Code
- ✅ VS Code Remote-SSH configuration
- ✅ Troubleshooting common issues
- ✅ Security best practices

**Key Principle:** Use dedicated groups (like `webdev`) instead of adding users to system groups (like `dev`) for better isolation and security.

---

## Additional Resources

- [VS Code Remote-SSH Documentation](https://code.visualstudio.com/docs/remote/ssh)
- [Linux File Permissions Guide](https://www.linux.com/training-tutorials/understanding-linux-file-permissions/)
- [SSH Key Authentication Guide](https://www.ssh.com/academy/ssh/keygen)
- [ACL Permissions Guide](https://www.redhat.com/sysadmin/linux-access-control-lists)

---

**Last Updated:** December 31, 2025  
**Tested On:** Ubuntu 22.04 LTS, Windows 11, VS Code 1.85+
