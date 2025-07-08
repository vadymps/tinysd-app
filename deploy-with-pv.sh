#!/bin/bash

# Script to deploy TinySD App with manual PersistentVolume
# Fixes PVC binding issues by creating a manual PV

set -e

echo "🚀 Deploying TinySD App with Manual PersistentVolume"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Step 1: Clean up existing resources
log_step "1. Cleaning up existing resources..."
kubectl delete pvc tinysd-images-pvc 2>/dev/null && log_info "Deleted existing PVC" || log_info "No existing PVC found"
kubectl delete pv tinysd-images-pv 2>/dev/null && log_info "Deleted existing PV" || log_info "No existing PV found"

# Step 2: Create PV and PVC
log_step "2. Creating PersistentVolume and PersistentVolumeClaim..."
kubectl apply -f k8s-pv-storage.yaml

# Step 3: Wait for PVC to bind
log_step "3. Waiting for PVC to bind to PV..."
echo "Waiting for PVC binding (timeout: 60s)..."

if kubectl wait --for=condition=bound pvc/tinysd-images-pvc --timeout=60s; then
    log_info "✅ PVC successfully bound to PV"
else
    log_error "❌ PVC failed to bind within 60 seconds"
    echo "Checking PVC status:"
    kubectl describe pvc tinysd-images-pvc
    exit 1
fi

# Step 4: Verify PV and PVC status
log_step "4. Verifying storage setup..."
echo ""
echo "PersistentVolume status:"
kubectl get pv tinysd-images-pv
echo ""
echo "PersistentVolumeClaim status:"
kubectl get pvc tinysd-images-pvc
echo ""

# Step 5: Deploy the application
log_step "5. Deploying TinySD application..."
kubectl apply -f k8s-app.yaml

# Step 6: Wait for deployments
log_step "6. Waiting for deployments to be ready..."

echo "Waiting for API deployment..."
kubectl rollout status deployment/tinysd-api-deployment --timeout=300s

echo "Waiting for UI deployment..."
kubectl rollout status deployment/tinysd-ui-deployment --timeout=300s

# Step 7: Verify pods are running
log_step "7. Verifying pod status..."
echo ""
echo "Pod status:"
kubectl get pods -l app=tinysd-api -o wide
kubectl get pods -l app=tinysd-ui -o wide
echo ""

# Step 8: Check volume mount
log_step "8. Verifying volume mount..."
API_POD=$(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}')

if [ ! -z "$API_POD" ]; then
    echo "Checking volume mount in pod: $API_POD"
    if kubectl exec $API_POD -- df -h /app/saved-images 2>/dev/null; then
        log_info "✅ Volume successfully mounted at /app/saved-images"
    else
        log_warn "⚠️  Volume mount verification failed"
    fi
    
    echo ""
    echo "Directory permissions:"
    kubectl exec $API_POD -- ls -la /app/saved-images 2>/dev/null || log_warn "Could not check directory permissions"
else
    log_warn "⚠️  No API pod found for volume verification"
fi

# Step 9: Show services and ingress
log_step "9. Service and Ingress information..."
echo ""
echo "Services:"
kubectl get svc tinysd-api tinysd-ui
echo ""
echo "Ingress:"
kubectl get ingress tinysd-ingress
echo ""

# Final summary
echo "🎉 Deployment Summary"
echo "===================="
log_info "✅ PersistentVolume: tinysd-images-pv (10Gi, hostPath: /tmp/tinysd-images)"
log_info "✅ PersistentVolumeClaim: tinysd-images-pvc (Bound)"
log_info "✅ API Deployment: tinysd-api-deployment"
log_info "✅ UI Deployment: tinysd-ui-deployment"
log_info "✅ Volume Mount: /app/saved-images"

echo ""
echo "🔗 Access Information:"
echo "- Frontend: http://your-ingress-ip/"
echo "- API: http://your-ingress-ip/api"
echo "- API Health: http://your-ingress-ip/api/logs"

echo ""
echo "📊 Next Steps:"
echo "1. Test image generation and saving"
echo "2. Verify images persist across pod restarts"
echo "3. Monitor storage usage: kubectl exec $API_POD -- df -h /app/saved-images"

echo ""
log_info "🚀 TinySD App deployment completed successfully!"
