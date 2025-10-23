# 🔍 Realtime Messaging Debug Guide

## Step 1: Verify Realtime is Enabled in Supabase

### Check Publications
1. Go to **Supabase Dashboard** → **Database** → **Publications**
2. Click on **`supabase_realtime`**
3. Verify **`messages`** table is listed
4. If not listed, run this SQL:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ```

### Check Replication (Alternative)
1. Go to **Database** → **Replication**  
2. Find **`messages`** table
3. Make sure the toggle is **ON** (enabled)

---

## Step 2: Test Realtime Connection

### Open Browser Console (Both Browsers)
1. Press **F12** to open Developer Tools
2. Go to **Console** tab
3. Keep it open during ALL testing

### Look for These Key Messages:

#### ✅ When Joining Room (BOTH browsers should show):
```
📡 Setting up Realtime subscription for room: [uuid]
   Channel name: room:[uuid]:[timestamp]
📡 Subscription setup complete, waiting for SUBSCRIBED status...
📡 Subscription status changed: CONNECTING
📡 Subscription status changed: SUBSCRIBED
✅ ========== SUBSCRIPTION ACTIVE ==========
✅ Listening for messages in room: [uuid]
✅ ==========================================
```

#### ✅ When Sending Message (Sender browser):
```
📤 Attempting to send message...
📨 Sending to Supabase: hello
✅ Message sent to database!
   This should trigger realtime for OTHER users
✅ Adding sent message to MY local state (optimistic)
```

#### ✅ When Receiving Message (OTHER browser - THIS IS CRITICAL!):
```
🔔 ========== REALTIME EVENT TRIGGERED ==========
🔔 INSERT detected on messages table!
🔔 Event payload: {...}
🔔 New message ID: [uuid]
📥 Fetching full message details...
✅ Full message fetched successfully!
   Message: hello
   From: John Doe
🚀 Calling onMessage callback...
✅ Callback executed
💬 Callback triggered with new message!
   ✅ Adding new message to state!
🔔 ========== END REALTIME EVENT ==========
```

---

## Step 3: Testing Checklist

### Browser 1 (Regular Chrome)
- [ ] Login as Student A
- [ ] Console open (F12)
- [ ] Join room "123"
- [ ] See: `✅ ========== SUBSCRIPTION ACTIVE ==========`
- [ ] Send message: "Hello from A"
- [ ] See: `✅ Message sent to database!`
- [ ] Message appears on RIGHT side (purple)

### Browser 2 (Incognito/Firefox)
- [ ] Login as Student B
- [ ] Console open (F12)
- [ ] Join room "123"
- [ ] See: `✅ ========== SUBSCRIPTION ACTIVE ==========`
- [ ] **CRITICAL**: See `🔔 REALTIME EVENT TRIGGERED` when Browser 1 sends
- [ ] Message appears on LEFT side (white)
- [ ] Message shows Student A's name

---

## Step 4: Common Issues & Fixes

### ❌ Issue: No `🔔 REALTIME EVENT TRIGGERED` in other browser

**Possible Causes:**
1. **Realtime not enabled in Supabase**
   - Fix: Go to Database → Publications → Add `messages` table
   
2. **Different room IDs (not same room number)**
   - Fix: Check console logs - both should show SAME room UUID
   
3. **WebSocket connection failed**
   - Fix: Check Network tab (F12 → Network → Filter "WS")
   - Should see connected WebSocket to Supabase
   
4. **RLS policies blocking**
   - Fix: Run this SQL to check policies:
     ```sql
     SELECT * FROM pg_policies WHERE tablename = 'messages';
     ```

### ❌ Issue: `Subscription status: CHANNEL_ERROR`

**Fix:**
1. Check Supabase project is not paused
2. Check internet connection
3. Try refreshing both browsers
4. Check Supabase status page: https://status.supabase.com/

### ❌ Issue: `⚠️ No data returned for message`

**Fix:**
1. Check `user_profiles` table has correct data:
   ```sql
   SELECT * FROM user_profiles WHERE id = '[user_id]';
   ```
2. Verify foreign key relationship is correct

---

## Step 5: Manual Realtime Test

In browser console, run:
```javascript
window.testRealtime()
```

Then in **Supabase SQL Editor**, insert a test message:
```sql
INSERT INTO messages (room_id, user_id, text) 
VALUES (
  (SELECT id FROM rooms LIMIT 1),
  (SELECT id FROM user_profiles LIMIT 1),
  'Test message'
);
```

**Expected:** Console should show `✅ Realtime is working! Received: ...`

---

## Step 6: Network Tab Check

1. Open **F12** → **Network** tab
2. Filter by **"WS"** (WebSocket)
3. You should see:
   - Connection to `wss://zppltopvyzuyhxgwrfwm.supabase.co/realtime/v1/websocket`
   - Status: **101 Switching Protocols** (means connected)
   - Click on it → **Messages** tab
   - Should see messages flowing when you send chats

---

## 🆘 If Still Not Working

Share these console outputs with developer:

1. **Subscription status messages** from BOTH browsers
2. **Any red error messages** from console
3. **WebSocket connection status** from Network tab
4. **Output of:** `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';`

---

## ✅ Success Checklist

- [x] Both browsers show `SUBSCRIPTION ACTIVE`
- [x] Sender sees `Message sent to database`
- [x] Receiver sees `REALTIME EVENT TRIGGERED`
- [x] Receiver sees `Callback executed`
- [x] Message appears in UI **instantly** (within 1-2 seconds)
- [x] No page refresh needed
- [x] Works for both directions (A→B and B→A)
