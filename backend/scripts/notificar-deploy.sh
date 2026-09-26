#!/usr/bin/env bash
# Avisa a Slack que terminó un deploy. El webhook vive solo en el EC2 (~/.slack_webhook).
COMMIT=$(git rev-parse --short HEAD)
curl -s -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"🚀 taller-api-empresarial desplegado (${COMMIT})\"}" \
  "$(cat ~/.slack_webhook)"
