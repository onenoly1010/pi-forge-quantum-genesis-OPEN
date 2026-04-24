#!/bin/bash
set -e

echo "🔧 Pi Forge Quantum Genesis Production Setup"
echo "=========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (sudo ./setup-production.sh)"
    exit 1
fi

# Update system
apt-get update
apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $SUDO_USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p /opt/pi-forge/{config,logs,backups,nginx/ssl}
chmod 755 /opt/pi-forge
chown -R $SUDO_USER:$SUDO_USER /opt/pi-forge

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp  # SSH
ufw allow 80/tcp  # HTTP
ufw allow 443/tcp # HTTPS
ufw --force enable

# Setup log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/pi-forge << LOGROTATE
/opt/pi-forge/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 $SUDO_USER $SUDO_USER
}
LOGROTATE

# Create systemd service for auto-start
echo "⚙️ Creating systemd service..."
cat > /etc/systemd/system/pi-forge.service << SYSTEMD
[Unit]
Description=Pi Forge Quantum Genesis
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/pi-forge
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=$SUDO_USER
Group=$SUDO_USER

[Install]
WantedBy=multi-user.target
SYSTEMD

systemctl daemon-reload
systemctl enable pi-forge.service

# Create backup script
echo "💾 Creating backup script..."
cat > /opt/pi-forge/backup.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR="/opt/pi-forge/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup docker volumes
docker run --rm -v pi-forge_postgres_data:/data -v $BACKUP_DIR:/backup alpine \
    tar czf /backup/postgres_$DATE.tar.gz -C /data .

# Backup logs
tar czf $BACKUP_DIR/logs_$DATE.tar.gz /opt/pi-forge/logs/

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/*_$DATE.tar.gz"
BACKUP

chmod +x /opt/pi-forge/backup.sh

# Setup cron for backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/pi-forge/backup.sh") | crontab -

# Create monitoring script
echo "📊 Creating health monitor..."
cat > /opt/pi-forge/health-check.sh << 'HEALTH'
#!/bin/bash
URL="https://forge.quantum-pi.org/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ "$RESPONSE" != "200" ]; then
    echo "❌ Health check failed: HTTP $RESPONSE"
    # Restart services
    cd /opt/pi-forge
    docker-compose -f docker-compose.prod.yml restart
    # Send alert (configure your alert system here)
fi
HEALTH

chmod +x /opt/pi-forge/health-check.sh

echo "✅ Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy SSL certificates to /opt/pi-forge/nginx/ssl/"
echo "2. Create .env file with production secrets"
echo "3. Run: cd /opt/pi-forge && docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "For GitHub Actions deployment:"
echo "1. Add these secrets to your repository:"
echo "   - PROD_HOST, PROD_USER, PROD_SSH_KEY"
echo "   - SUPABASE_URL, SUPABASE_KEY, JWT_SECRET"
echo "2. Push to main branch to trigger auto-deploy"
