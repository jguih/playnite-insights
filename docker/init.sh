#!/bin/sh
set -e

# Set defaults if not provided
PUID=${PUID:-1000}
PGID=${PGID:-1000}
WORK_DIR=${WORK_DIR:-/app}
DATA_DIR="${WORK_DIR}/data"
APP_USER=playnite-insights
APP_GROUP=playnite-insights

echo "[INIT] Using PUID=$PUID PGID=$PGID"

# # Find group name by GID, or create if it doesn't exist
# EXISTING_GROUP=$(getent group "$PGID" | awk -F: '{print $1}')
# if [ -n "$EXISTING_GROUP" ]; then
#     echo "[INIT] Found existing group '$EXISTING_GROUP' with GID $PGID"
#     APP_GROUP="$EXISTING_GROUP"
# else
#     if ! getent group "$APP_GROUP" >/dev/null 2>&1; then
#         echo "[INIT] Creating group '$APP_GROUP' with GID $PGID"
#         addgroup -g "$PGID" "$APP_GROUP"
#     fi
# fi

# # Find user name by UID, or create if it doesn't exist
# EXISTING_USER=$(getent passwd "$PUID" | awk -F: '{print $1}')
# if [ -n "$EXISTING_USER" ]; then
#     echo "[INIT] Found existing user '$EXISTING_USER' with UID $PUID"
#     APP_USER="$EXISTING_USER"
# else
#     if ! id -u "$APP_USER" >/dev/null 2>&1; then
#         echo "[INIT] Creating user '$APP_USER' with UID $PUID and GID $PGID"
#         adduser -D -u "$PUID" -G "$APP_GROUP" -s /bin/sh "$APP_USER"
#     fi
# fi

# Ensure data directory exists
echo "[INIT] Ensuring data directory exists at $DATA_DIR"
mkdir -p "$DATA_DIR"
echo "[INIT] Ensuring subdirectories (files, logs, tmp) exist in $DATA_DIR"
mkdir -p "$DATA_DIR/files"
mkdir -p "$DATA_DIR/logs"
mkdir -p "$DATA_DIR/tmp"

# # Only set ownership if any file/dir under WORK_DIR is not owned by PUID:PGID
# echo "[INIT] Setting ownership of files to $PUID:$PGID"
# find "${WORK_DIR}" \( ! -user "$PUID" -o ! -group "$PGID" \) -exec chown "$PUID:$PGID" {} +

echo "[INIT] Running as user '$APP_USER' (UID $PUID, GID $PGID): $*"
exec "$@"