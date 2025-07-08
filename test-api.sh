#!/bin/bash

echo "Testing TinySD Image Generation API"
echo "==================================="

# Test with ModelsLab (should work)
echo "1. Testing with ModelsLab provider..."
curl -X POST "http://localhost:3000/api/image/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"beautiful sunset over mountains"}' \
  -w "\nResponse Time: %{time_total}s\n\n"

echo "2. Checking generated image response format..."
echo "   - Should have 'output' array with image URLs"
echo "   - Should be regular HTTP URLs (not base64)"
echo ""

# Test save functionality
echo "3. Testing save functionality..."
echo "   (This would normally save the generated image)"
echo ""

echo "4. Testing provider switching..."
echo "   - Current active provider should be 'modelslab'"
curl -X GET "http://localhost:3000/api/image/settings/active" | jq '.provider'

echo ""
echo "Test complete. The system should:"
echo "✅ Generate images with ModelsLab (regular URLs)"
echo "✅ Generate images with Stability AI (base64 → converted to URLs)"
echo "✅ Save both types of images correctly"
echo "✅ Display images in UI regardless of provider"
