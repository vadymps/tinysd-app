# Kubernetes Persistent Volume Image Storage Analysis

## 📊 **Current Configuration Analysis**

### **Persistent Volume Setup**

```yaml
# PersistentVolumeClaim
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: tinysd-images-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard
```

### **Pod Volume Mount**

```yaml
# In tinysd-api-deployment
volumeMounts:
  - name: saved-images-storage
    mountPath: /app/saved-images
volumes:
  - name: saved-images-storage
    persistentVolumeClaim:
      claimName: tinysd-images-pvc
```

### **Application Storage Path**

```typescript
// In image.service.ts
private readonly imagesDir = path.join(process.cwd(), 'saved-images');
// This resolves to: /app/saved-images (in container)
```

## 🎯 **Storage Flow Analysis**

### **1. Image Save Process**

```
User saves image → API downloads image → Saves to /app/saved-images/image_[timestamp].jpg
                                      ↓
                               Mounted PVC storage
                                      ↓
                               Persists on cluster storage
```

### **2. Deployment Lifecycle**

```
Pod Creation → PVC mounts to /app/saved-images → App reads existing files
Pod Restart → Same PVC remounts → All previous images available
Pod Update  → Same PVC remounts → Zero data loss
```

## ✅ **Persistent Storage Verification**

### **Test 1: Image Persistence After Pod Restart**

```bash
# 1. Save some images via the application
# 2. Check images are in the pod
kubectl exec -it <pod-name> -- ls -la /app/saved-images/

# 3. Restart the pod
kubectl rollout restart deployment/tinysd-api-deployment

# 4. Verify images are still there
kubectl exec -it <pod-name> -- ls -la /app/saved-images/
```

### **Test 2: Deployment Update Persistence**

```bash
# 1. Save images via app
# 2. Update deployment with new image version
kubectl set image deployment/tinysd-api-deployment tinysd-api=vadimpastushenko7/tinysd-api:new-tag

# 3. Check images persist after update
kubectl exec -it <pod-name> -- ls -la /app/saved-images/
```

### **Test 3: PVC Status Check**

```bash
# Check PVC is bound and healthy
kubectl get pvc tinysd-images-pvc
kubectl describe pvc tinysd-images-pvc

# Check PV details
kubectl get pv
kubectl describe pv <pv-name>
```

## 🔍 **Verification Commands**

### **Check Current Storage**

```bash
# List all saved images in the pod
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- find /app/saved-images -name "*.jpg" -ls

# Check disk usage
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- df -h /app/saved-images

# Check directory permissions
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- ls -la /app/saved-images
```

### **Database vs File System Consistency**

```bash
# Check MongoDB for image metadata
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- curl -s localhost:3000/api/image/saved | jq '.'

# Compare with actual files
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- ls -la /app/saved-images/
```

## 🛠️ **Potential Issues & Solutions**

### **Issue 1: Permission Problems**

```yaml
# Add security context to deployment
securityContext:
  runAsUser: 1000
  runAsGroup: 1000
  fsGroup: 1000
```

### **Issue 2: Storage Class Not Available**

```bash
# Check available storage classes
kubectl get storageclass

# Update PVC if needed
spec:
  storageClassName: "your-storage-class"
```

### **Issue 3: ReadWriteOnce Limitation**

```yaml
# For multi-replica deployments, use ReadWriteMany
spec:
  accessModes:
    - ReadWriteMany # If supported by your storage provider
```

## 🔄 **Complete Test Scenario**

### **Step 1: Deploy and Save Images**

```bash
# Deploy the application
kubectl apply -f k8s-app.yaml

# Wait for deployment
kubectl rollout status deployment/tinysd-api-deployment

# Save some images via the UI
# Navigate to http://your-app-url/image-generator
# Generate and save 2-3 images
```

### **Step 2: Verify Storage**

```bash
# Check PVC status
kubectl get pvc tinysd-images-pvc

# List saved images
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- ls -la /app/saved-images/

# Check API endpoint
curl http://your-app-url/api/image/saved
```

### **Step 3: Test Persistence**

```bash
# Force pod restart
kubectl delete pod -l app=tinysd-api

# Wait for new pod
kubectl wait --for=condition=Ready pod -l app=tinysd-api

# Verify images are still there
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- ls -la /app/saved-images/

# Check gallery still works
curl http://your-app-url/api/image/saved
```

### **Step 4: Test Deployment Update**

```bash
# Update deployment (trigger new rollout)
kubectl patch deployment tinysd-api-deployment -p '{"spec":{"template":{"metadata":{"annotations":{"rollout":"'$(date +%s)'"}}}}}'

# Wait for rollout
kubectl rollout status deployment/tinysd-api-deployment

# Verify persistence
kubectl exec -it $(kubectl get pods -l app=tinysd-api -o jsonpath='{.items[0].metadata.name}') -- ls -la /app/saved-images/
```

## 📋 **Expected Results**

### **✅ Success Indicators**

- PVC shows "Bound" status
- Images persist after pod restarts
- Images persist after deployment updates
- File system and database stay in sync
- Gallery shows all saved images after restarts

### **❌ Failure Indicators**

- PVC shows "Pending" status
- Images disappear after pod restart
- Permission denied errors
- Database/file system inconsistency

## 🔧 **Enhanced Configuration (Optional)**

### **Add Init Container for Permissions**

```yaml
initContainers:
  - name: fix-permissions
    image: busybox
    command:
      [
        "sh",
        "-c",
        "chown -R 1000:1000 /app/saved-images && chmod -R 755 /app/saved-images",
      ]
    volumeMounts:
      - name: saved-images-storage
        mountPath: /app/saved-images
```

### **Add Health Check for Storage**

```yaml
livenessProbe:
  exec:
    command:
      - sh
      - -c
      - "test -d /app/saved-images && test -w /app/saved-images"
  initialDelaySeconds: 30
  periodSeconds: 10
```

## 🎯 **Production Recommendations**

1. **Backup Strategy**: Implement regular PV backups
2. **Monitoring**: Add storage usage monitoring
3. **Security**: Use proper RBAC and network policies
4. **Scaling**: Consider ReadWriteMany for multi-replica deployments
5. **Cleanup**: Implement image cleanup policies for old images

---

**Next Steps**: Run the verification commands to test your persistent storage setup in your Kubernetes cluster.
