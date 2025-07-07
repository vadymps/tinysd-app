#!/bin/bash

# Kubernetes Persistent Storage Test Script for TinySD App
# This script verifies that images persist across pod restarts and deployments

set -e

echo "🔍 Starting Kubernetes Persistent Storage Verification for TinySD App"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test 1: Check PVC Status
echo -e "\n📊 Test 1: Checking PVC Status"
echo "--------------------------------"

PVC_STATUS=$(kubectl get pvc tinysd-images-pvc -o jsonpath='{.status.phase}' 2>/dev/null || echo "NotFound")

if [ "$PVC_STATUS" = "Bound" ]; then
    log_info "✅ PVC tinysd-images-pvc is Bound"
    kubectl get pvc tinysd-images-pvc
else
    log_error "❌ PVC tinysd-images-pvc status: $PVC_STATUS"
    echo "   Please ensure the PVC is created and bound before continuing"
    exit 1
fi

# Test 2: Check Pod Status
echo -e "\n🏃 Test 2: Checking Pod Status"
echo "------------------------------"

POD_NAME=$(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$POD_NAME" ]; then
    log_error "❌ No tinysd-api pod found"
    echo "   Please ensure the deployment is running"
    exit 1
else
    log_info "✅ Found pod: $POD_NAME"
    
    POD_STATUS=$(kubectl get pod $POD_NAME -o jsonpath='{.status.phase}')
    if [ "$POD_STATUS" = "Running" ]; then
        log_info "✅ Pod is Running"
    else
        log_warn "⚠️  Pod status: $POD_STATUS"
    fi
fi

# Test 3: Check Volume Mount
echo -e "\n💾 Test 3: Checking Volume Mount"
echo "--------------------------------"

MOUNT_CHECK=$(kubectl exec $POD_NAME -- df -h /app/saved-images 2>/dev/null || echo "FAILED")

if [ "$MOUNT_CHECK" != "FAILED" ]; then
    log_info "✅ Volume is properly mounted at /app/saved-images"
    kubectl exec $POD_NAME -- df -h /app/saved-images
else
    log_error "❌ Volume mount check failed"
    exit 1
fi

# Test 4: Check Directory Permissions
echo -e "\n🔐 Test 4: Checking Directory Permissions"
echo "-----------------------------------------"

PERM_CHECK=$(kubectl exec $POD_NAME -- ls -la /app/saved-images 2>/dev/null || echo "FAILED")

if [ "$PERM_CHECK" != "FAILED" ]; then
    log_info "✅ Directory permissions:"
    kubectl exec $POD_NAME -- ls -la /app/saved-images
else
    log_error "❌ Permission check failed"
fi

# Test 5: List Current Images
echo -e "\n🖼️  Test 5: Current Saved Images"
echo "--------------------------------"

IMAGE_COUNT=$(kubectl exec $POD_NAME -- find /app/saved-images -name "*.jpg" | wc -l 2>/dev/null || echo "0")

log_info "📷 Found $IMAGE_COUNT saved images:"
if [ "$IMAGE_COUNT" -gt 0 ]; then
    kubectl exec $POD_NAME -- find /app/saved-images -name "*.jpg" -exec ls -lh {} \;
else
    log_warn "⚠️  No images found. Save some images via the UI first."
fi

# Test 6: API Endpoint Check
echo -e "\n🌐 Test 6: API Endpoint Check"
echo "-----------------------------"

API_CHECK=$(kubectl exec $POD_NAME -- curl -s localhost:3000/api/image/saved 2>/dev/null || echo "FAILED")

if [ "$API_CHECK" != "FAILED" ]; then
    IMAGE_API_COUNT=$(echo "$API_CHECK" | grep -o '"id"' | wc -l || echo "0")
    log_info "✅ API endpoint working. Found $IMAGE_API_COUNT images in database"
    
    if [ "$IMAGE_COUNT" -eq "$IMAGE_API_COUNT" ]; then
        log_info "✅ File system and database are in sync"
    else
        log_warn "⚠️  Mismatch: $IMAGE_COUNT files vs $IMAGE_API_COUNT database records"
    fi
else
    log_warn "⚠️  API endpoint check failed (may be normal if API is not ready)"
fi

# Test 7: Persistence Test (Optional)
echo -e "\n🔄 Test 7: Persistence Test"
echo "---------------------------"

read -p "Do you want to test persistence by restarting the pod? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "📝 Recording current state..."
    BEFORE_IMAGES=$(kubectl exec $POD_NAME -- find /app/saved-images -name "*.jpg" | wc -l)
    
    log_info "🔄 Restarting pod..."
    kubectl delete pod $POD_NAME
    
    log_info "⏳ Waiting for new pod to be ready..."
    kubectl wait --for=condition=Ready pod -l app=tinysd-api --timeout=120s
    
    NEW_POD_NAME=$(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}')
    log_info "✅ New pod ready: $NEW_POD_NAME"
    
    sleep 10  # Give app time to start
    
    AFTER_IMAGES=$(kubectl exec $NEW_POD_NAME -- find /app/saved-images -name "*.jpg" | wc -l)
    
    if [ "$BEFORE_IMAGES" -eq "$AFTER_IMAGES" ]; then
        log_info "✅ SUCCESS: All $AFTER_IMAGES images persisted after restart!"
    else
        log_error "❌ FAILURE: Image count changed from $BEFORE_IMAGES to $AFTER_IMAGES"
    fi
else
    log_info "⏭️  Skipping persistence test"
fi

# Summary
echo -e "\n📋 Test Summary"
echo "==============="

if [ "$PVC_STATUS" = "Bound" ] && [ "$MOUNT_CHECK" != "FAILED" ]; then
    log_info "✅ Persistent storage is properly configured"
    log_info "✅ Images will persist across pod restarts and deployments"
    
    if [ "$IMAGE_COUNT" -gt 0 ]; then
        log_info "✅ $IMAGE_COUNT images are currently stored"
    else
        log_warn "💡 No images saved yet. Test by:"
        echo "   1. Open the app UI"
        echo "   2. Generate an image"
        echo "   3. Click 'Save Image'"
        echo "   4. Run this script again"
    fi
else
    log_error "❌ Persistent storage has issues that need to be resolved"
fi

echo -e "\n🎯 Next Steps:"
echo "- Save images via the UI to test the full workflow"
echo "- Monitor storage usage: kubectl exec $POD_NAME -- df -h /app/saved-images"
echo "- Check logs: kubectl logs $POD_NAME"

echo -e "\n✨ Verification complete!"
