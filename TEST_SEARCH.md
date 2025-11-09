# Global Search Testing Guide

## How to Test and Debug

### Step 1: Check if Items Exist in Database

1. Go to **Item Catalog** page
2. Do you see your "iphone" items listed?
   - ✅ YES → Items exist, search issue
   - ❌ NO → Items not in database yet

### Step 2: Open Browser Console

1. Press **F12** (or right-click → Inspect)
2. Click **Console** tab
3. Keep it open while testing

### Step 3: Open Search

1. Press **Cmd+K** (Mac) or **Ctrl+K** (Windows)
2. Command palette should open

### Step 4: Type and Watch Console

1. Type "iphone" slowly
2. Watch the console for these messages:

**Expected Console Output:**
```
🔍 Searching for: ip
📦 Searching items...
📦 Found items: 2
✅ Matching items: 1
🎯 Total results: 1
```

### What to Look For:

#### ✅ Good Signs:
- You see 🔍 emoji logs
- "Found items: X" shows number > 0
- "Matching items: X" shows matches

#### ❌ Problem Signs:
- No console logs at all → Search not triggering
- "Found items: 0" → No items in database
- Red error messages → Database/auth issue
- "Matching items: 0" but "Found items: 2" → Fuzzy match issue

### Common Issues:

**1. No Console Logs**
- Search palette not opening
- Keyboard shortcut not working
- Click the search bar in header instead

**2. "Found items: 0"**
- Items not saved to database
- Wrong user logged in (RLS filtering items)
- Go to Item Catalog page and verify items exist

**3. Error: "Not authenticated"**
- Session expired
- Refresh page and log in again

**4. "Matching items: 0" but items exist**
- Case sensitivity issue (shouldn't happen with toLowerCase)
- Name doesn't contain "iphone"
- Check exact item name in database

### Test Checklist:

- [ ] Browser console open (F12)
- [ ] Logged into application
- [ ] Items visible on Item Catalog page
- [ ] Command palette opens (Cmd/Ctrl + K)
- [ ] Console shows debug logs when typing
- [ ] Results appear in search dialog

### If Still Not Working:

**Copy this info and share:**
1. What you see in console
2. Screenshot of Item Catalog page
3. Screenshot of search dialog
4. Any red error messages

### Quick Test Commands:

Open console and run these directly:

```javascript
// Test 1: Check if items exist
const { data, error } = await supabase.from('items').select('*');
console.log('Items:', data, 'Error:', error);

// Test 2: Check authentication
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.email);

// Test 3: Test fuzzy match function
function fuzzyMatch(search, target) {
  const searchLower = search.toLowerCase();
  const targetLower = target.toLowerCase();
  if (targetLower.includes(searchLower)) return true;
  let searchIndex = 0;
  for (let i = 0; i < targetLower.length && searchIndex < searchLower.length; i++) {
    if (targetLower[i] === searchLower[searchIndex]) searchIndex++;
  }
  return searchIndex === searchLower.length;
}

console.log('Testing fuzzy match:');
console.log('iphone in iphone:', fuzzyMatch('iphone', 'iphone'));
console.log('iphoen in iphone:', fuzzyMatch('iphoen', 'iphone'));
console.log('iphn in iphone:', fuzzyMatch('iphn', 'iphone'));
```
