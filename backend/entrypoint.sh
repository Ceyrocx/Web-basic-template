#!/bin/sh
set -e

# Apply DB migrations before starting the server
alembic upgrade head

exec "$@"
