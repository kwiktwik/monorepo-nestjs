#!/bin/bash

set -e

echo "🚀 Updating system..."
apt update && apt upgrade -y

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
ALTER USER postgres WITH PASSWORD 'postgress';
CREATE DATABASE kiranaapps;
GRANT ALL PRIVILEGES ON DATABASE kiranaapps TO postgres;
EOF"

echo "⚙️ Enabling password authentication..."

PG_HBA=$(find /etc/postgresql -name pg_hba.conf)

sed -i 's/peer/md5/g' $PG_HBA

echo "🔄 Restarting PostgreSQL..."
service postgresql restart

# ======================
# Setup Environment File
# ======================
echo "🧾 Setting up environment file..."
if [ -f ".env.example" ] && [ ! -f ".env.local" ]; then
  cp ".env.example" ".env.local"
  echo "✅ Created .env.local from .env.example"
elif [ -f ".env.local" ]; then
  echo "ℹ️ .env.local already exists, skipping copy"
else
  echo "⚠️ .env.example not found, skipping .env.local creation"
fi


# ======================
# Final Checks
# ======================
echo "🧪 Testing PostgreSQL..."
PGPASSWORD=postgress psql -h localhost -U postgres -d kiranaapps -c '\l' || true

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
echo "DATABASE_URL=postgresql://postgres:postgress@localhost:5432/kiranaapps"
echo "-----------------------------------"