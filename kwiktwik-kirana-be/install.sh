#!/bin/bash

set -e

echo "🚀 Updating system..."
apt update && apt upgrade -y

# ======================
# Setup Environment File
# ======================
echo "🧾 Setting up environment file..."
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ] && [ -f ".env.example" ]; then
  cp ".env.example" "$ENV_FILE"
  echo "✅ Created .env.local from .env.example"
elif [ -f "$ENV_FILE" ]; then
  echo "ℹ️ .env.local already exists, using existing file"
else
  echo "⚠️ .env.example not found, continuing with defaults"
  ENV_FILE=""
fi

DB_URL=""
if [ -n "$ENV_FILE" ]; then
  DB_URL=$(awk -F= '/^DATABASE_URL=/{sub(/^DATABASE_URL=/, ""); print; exit}' "$ENV_FILE")
  DB_URL="${DB_URL%\"}"
  DB_URL="${DB_URL#\"}"
fi
DB_URL="${DB_URL:-postgresql://postgres:postgress@localhost:5432/kiranaapps}"
DB_CONN="${DB_URL#*://}"
DB_CREDENTIALS="${DB_CONN%@*}"
DB_HOST_PORT_DB="${DB_CONN#*@}"
DB_USER="${DB_CREDENTIALS%%:*}"
DB_PASS="${DB_CREDENTIALS#*:}"
DB_HOST_PORT="${DB_HOST_PORT_DB%%/*}"
DB_NAME="${DB_HOST_PORT_DB#*/}"
DB_NAME="${DB_NAME%%\?*}"
DB_HOST="${DB_HOST_PORT%%:*}"
DB_PORT="${DB_HOST_PORT##*:}"

if [ "$DB_HOST" = "$DB_HOST_PORT" ]; then
  DB_PORT="5432"
fi

# ======================
# Install Redis
# ======================
echo "📦 Installing Redis..."
apt install redis-server -y

echo "⚙️ Configuring Redis..."
sed -i 's/^supervised .*/supervised systemd/' /etc/redis/redis.conf || true

echo "🔄 Starting Redis..."
service redis-server restart || redis-server --daemonize yes

echo "🧪 Testing Redis..."
redis-cli ping || true


# ======================
# Install PostgreSQL
# ======================
echo "📦 Installing PostgreSQL..."
apt install postgresql postgresql-contrib -y

echo "🔄 Starting PostgreSQL..."
service postgresql start

echo "🔐 Setting up database..."

su - postgres -c "psql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$DB_PASS';
  ELSE
    ALTER USER \"$DB_USER\" WITH PASSWORD '$DB_PASS';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE \"$DB_NAME\"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_USER\";
EOF"

echo "⚙️ Enabling password authentication..."

PG_HBA=$(find /etc/postgresql -name pg_hba.conf)

sed -i 's/peer/md5/g' $PG_HBA

echo "🔄 Restarting PostgreSQL..."
service postgresql restart

# ======================
# Final Checks
# ======================
echo "🧪 Testing PostgreSQL..."
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\l' || true

echo ""
echo "🎉 Setup complete!"
echo ""
echo "✅ Your .env should be:"
echo "-----------------------------------"
echo "PORT=3002"
echo "NODE_ENV=development"
echo ""
echo "REDIS_URL=redis://localhost:6379"
echo ""
echo "DATABASE_URL=$DB_URL"
echo "-----------------------------------"