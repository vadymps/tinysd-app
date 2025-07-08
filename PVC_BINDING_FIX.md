# PVC Binding Issue Solutions

## 🚨 **Problem**: PVC has unbound immediate PersistentVolumeClaims

Your PVC `tinysd-images-pvc` is not binding because the `storageClassName: standard` either doesn't exist or has no available storage.

## 🔧 **Solutions**

### **Solution 1: Check Available Storage Classes**

```bash
kubectl get storageclass
```

If no storage classes exist, you'll need to create one or use a different approach.

### **Solution 2: Use Default Storage Class**

Remove the `storageClassName` to use the default storage class:

```yaml
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
  # Remove storageClassName to use default
```

### **Solution 3: Create a Manual PersistentVolume (Local Development)**

For local development/testing, create a host path PV:

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: tinysd-images-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /tmp/tinysd-images
---
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
  # No storageClassName - will bind to available PV
```

### **Solution 4: Use Local Storage Class (Kind/Minikube)**

If using Kind or Minikube:

```yaml
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
  storageClassName: local-path # Common in Kind
```

### **Solution 5: Use EmptyDir (Non-Persistent - Testing Only)**

For testing without persistence:

```yaml
# In deployment spec:
volumes:
  - name: saved-images-storage
    emptyDir: {}
```

## ✅ **RECOMMENDED SOLUTION: Create Manual PersistentVolume**

Since your cluster doesn't have dynamic provisioning, create a manual PV:

### **Step 1: Create PV and PVC**

```bash
# Option A: Use separate PV file
kubectl apply -f k8s-pv-storage.yaml

# Option B: Use updated main manifest (includes PV)
kubectl apply -f k8s-app.yaml
```

### **Step 2: Verify PV and PVC**

```bash
# Check PV is available
kubectl get pv tinysd-images-pv

# Check PVC is bound
kubectl get pvc tinysd-images-pvc

# Should show:
# NAME                STATUS   VOLUME             CAPACITY   ACCESS MODES
# tinysd-images-pvc   Bound    tinysd-images-pv   10Gi       RWO
```

### **Step 3: Deploy Application**

```bash
kubectl apply -f k8s-app.yaml
```

### **Step 4: Verify Pod Starts**

```bash
kubectl get pods -l app=tinysd-api
kubectl describe pod <pod-name>
```

## 🔧 **PV Configuration Details**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: tinysd-images-pv
  labels:
    app: tinysd
    type: local
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /tmp/tinysd-images # Directory on the Kubernetes node
    type: DirectoryOrCreate # Creates directory if it doesn't exist
```

```yaml
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
  selector:
    matchLabels:
      app: tinysd # Matches the PV labels
      type: local
```

## 🎯 **Key Points**

1. **Host Path**: Images will be stored in `/tmp/tinysd-images` on the Kubernetes node
2. **Label Selector**: PVC specifically binds to our PV using labels
3. **Reclaim Policy**: `Retain` means data persists even if PVC is deleted
4. **Directory Creation**: `DirectoryOrCreate` automatically creates the directory

## 🚀 **Quick Deployment Commands**

```bash
# 1. Clean up any existing resources
kubectl delete pvc tinysd-images-pvc 2>/dev/null || true
kubectl delete pv tinysd-images-pv 2>/dev/null || true

# 2. Create PV and PVC
kubectl apply -f k8s-pv-storage.yaml

# 3. Wait for binding
kubectl wait --for=condition=bound pvc/tinysd-images-pvc --timeout=60s

# 4. Deploy application
kubectl apply -f k8s-app.yaml

# 5. Verify everything is working
kubectl get pv,pvc,pods
```

## 🎯 **Recommended Fix for Your Setup**

Based on your cluster address (192.168.56.10), you're likely using a custom setup. Try this updated PVC:

```yaml
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
  # Remove storageClassName to use default
```

## 🔍 **Debugging Commands**

```bash
# Check PVC status
kubectl get pvc tinysd-images-pvc -o yaml

# Check available storage classes
kubectl get storageclass

# Check PV available
kubectl get pv

# Check pod events
kubectl describe pod <your-pod-name>

# Check PVC events
kubectl describe pvc tinysd-images-pvc
```

## 🚀 **Quick Fix Steps**

1. **Delete current PVC**:

```bash
kubectl delete pvc tinysd-images-pvc
```

2. **Update k8s-app.yaml** with modified PVC (remove storageClassName)

3. **Redeploy**:

```bash
kubectl apply -f k8s-app.yaml
```

4. **Verify**:

```bash
kubectl get pvc
kubectl get pods
```
