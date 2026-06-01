# Code Cleanup & Optimization Plan

## Priority 1: CRITICAL - Fix Race Conditions & Errors (Do First!)

### Issue 1: Global `imagesArr` Variable Race Condition
**Impact:** Data corruption in concurrent uploads
**Affected Files:** 7 controllers
**Fix:** Use request middleware instead of globals

### Issue 2: Missing Return Statements
**Impact:** Silent failures, code continues after error
**Affected Files:** 3+ controllers
**Fix:** Add missing returns

---

## Priority 2: HIGH - Consolidate Duplicate Code

### Duplicate Banner Controllers (4 files, 900+ lines)
- bannerV1.controller.js (232 lines)
- bannerList2.controller.js (226 lines)
- homeSlider.controller.js (305 lines)
- logo.controller.js (208 lines)

**Solution:** Create generic `ImageManager` controller

### Cloudinary Config Duplication (8 files)
**Solution:** Create centralized Cloudinary config

### Image Deletion Logic (8 occurrences)
**Solution:** Extract to utility service

---

## Priority 3: MEDIUM - Performance & Bundle

### Remove Unused Code
- Backup files
- Unused imports
- Consolidate payment routes

### Optimize Dependencies
- Unified MUI versions
- Remove heavy packages
- Lazy load Firebase

---

## Files to Refactor
1. Create: `server/services/imageService.js`
2. Create: `server/config/cloudinaryConfig.js`
3. Refactor: 7 image-related controllers
4. Fix: Error handlers (missing returns)
5. Remove: Backup files
6. Cleanup: Unused imports

---

## Total Expected Savings
- **Lines Eliminated:** 1,000+
- **Bundle Size:** 10-15% reduction
- **Load Time:** 20-30% faster
- **Issues Fixed:** 10+ critical/medium bugs
