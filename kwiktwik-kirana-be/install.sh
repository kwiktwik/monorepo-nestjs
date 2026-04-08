#!/bin/bash

set -e

echo "🚀 Updating system..."
apt update && apt upgrade -y

# Fix locale
apt install -y locales 2>/dev/null || true
locale-gen en_US.UTF-8 2>/dev/null || true
update-locale LANG=en_US.UTF-8 2>/dev/null || true
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# ======================
# Setup Environment File
# ======================
echo "🧾 Setting up environment file..."
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ] && [ -f ".env.example" ]; then
  cp ".env.example" "$ENV_FILE"
  echo "✅ Created .env.local from .env.example"
elif [ -f "$ENV_FILE" ]; then
  echo "ℹ️ .env.local already exists"
else
  echo "⚠️ .env.example not found, using defaults"
  ENV_FILE=""
fi

# Default DB config
DB_URL="postgresql://postgres:postgres@localhost:5432/kiranaapps"

if [ -n "$ENV_FILE" ]; then
  RAW=$(awk -F= '/^DATABASE_URL=/{print $2}' "$ENV_FILE" | tr -d '"')
  [ -n "$RAW" ] && DB_URL="$RAW"
fi

# Parse DB URL
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

[ "$DB_HOST" = "$DB_HOST_PORT" ] && DB_PORT="5432"

echo "📋 Parsed DB config → user=$DB_USER db=$DB_NAME host=$DB_HOST port=$DB_PORT"

# ======================
# Install Redis
# ======================
echo "📦 Installing Redis..."
apt install -y redis-server

echo "🔄 Starting Redis..."
service redis-server start || redis-server --daemonize yes

echo "🧪 Testing Redis..."
redis-cli ping && echo "✅ Redis is up" || echo "⚠️ Redis ping failed"

# ======================
# Install PostgreSQL
# ======================
echo "📦 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

echo "🔄 Starting PostgreSQL..."
service postgresql start
sleep 2

# ======================
# Patch pg_hba.conf
# ======================
echo "⚙️ Patching pg_hba.conf..."
PG_HBA=$(find /etc/postgresql -name pg_hba.conf | head -1)
echo "📄 Found: $PG_HBA"
cp "$PG_HBA" "${PG_HBA}.bak"

cat > "$PG_HBA" <<'HBAEOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
local   replication     all                                     peer
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
HBAEOF

chown postgres:postgres "$PG_HBA"
chmod 640 "$PG_HBA"

service postgresql restart
sleep 2

# ======================
# Setup Database
# ======================
echo "🔐 Setting up database user and database..."

# Step 1: Create/update role (DO block is fine for roles)
su - postgres -c "psql -v ON_ERROR_STOP=1" <<EOF
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE ROLE "$DB_USER" LOGIN PASSWORD '$DB_PASS';
      RAISE NOTICE 'Created role $DB_USER';
   ELSE
      ALTER USER "$DB_USER" WITH PASSWORD '$DB_PASS';
      RAISE NOTICE 'Updated password for $DB_USER';
   END IF;
END
\$\$;
EOF

# Step 2: Create database — must be outside DO block
DB_EXISTS=$(su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\"")
if [ "$DB_EXISTS" != "1" ]; then
  su - postgres -c "psql -c 'CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\"'"
  echo "✅ Created database $DB_NAME"
else
  echo "ℹ️ Database $DB_NAME already exists"
fi

# ======================
# Final Check
# ======================
echo "🧪 Testing PostgreSQL connection..."
PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\l' \
  && echo "✅ PostgreSQL connection successful" \
  || echo "⚠️ PostgreSQL connection test failed — check credentials"

# ======================
# Write final .env.local
# ======================
echo "📝 Writing final .env.local..."
cat > .env.local <<ENVEOF
PORT=3002
NODE_ENV=development

REDIS_URL=redis://localhost:6379

DATABASE_URL=$DB_URL
ENVEOF

echo ""
echo "🎉 Setup complete!"
echo ""
echo "✅ Your .env.local:"
echo "-----------------------------------"
cat .env.local
echo "-----------------------------------"