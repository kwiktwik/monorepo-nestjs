# Crafto Feed API - Infinite Scroll Guide

## Overview

The Crafto Feed API (`/api/crafto/home/v1.7`) has been enhanced with **cursor-based pagination** to provide reliable infinite scroll functionality. This guide explains how to implement infinite scroll in your application.

## What Changed?

### Before (Time-based Offset)
- Used `YYYYMMDDHH` format for pagination
- Could cause duplicates or skipped items when multiple posts have the same timestamp
- Not ideal for real-time feeds

### After (Cursor-based Pagination)
- Uses base64-encoded cursor containing timestamp + unique ID
- Guarantees no duplicates or skipped items
- Perfect for infinite scroll implementations
- Backward compatible with old offset method

## API Response Structure

```json
{
  "data": [...],           // Array of quote items
  "cursor": "eyJ0aW1l...", // Use this for next page (RECOMMENDED)
  "hasMore": true,         // Boolean indicating if more items exist
  "offset": "2026011615",  // Deprecated, kept for backward compatibility
  "limit": 20,
  "filterText": null,
  "selectedFilterId": null,
  "popup": null,
  "isBuggyFeedAlertWhitelisted": false,
  "configuration": {...}
}
```

## How to Implement Infinite Scroll

### 1. First Page Request

```http
GET /api/crafto/home/v1.7?limit=20
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "data": [...20 items...],
  "cursor": "eyJ0aW1lc3RhbXAiOiIyMDI2LTAxLTE2VDE1OjAwOjAwLjAwMFoiLCJpZCI6MTIzfQ==",
  "hasMore": true,
  "limit": 20
}
```

### 2. Next Page Request

Use the `cursor` from the previous response:

```http
GET /api/crafto/home/v1.7?cursor=eyJ0aW1lc3RhbXAiOiIyMDI2LTAxLTE2VDE1OjAwOjAwLjAwMFoiLCJpZCI6MTIzfQ==&limit=20
Authorization: Bearer YOUR_TOKEN
```

### 3. Check if More Items Exist

Use the `hasMore` field to determine if you should load more:

```javascript
if (response.hasMore) {
  // Show "Load More" button or trigger auto-load
} else {
  // Show "End of feed" message
}
```

## Implementation Examples

### React/Next.js Example

```typescript
import { useState, useEffect } from 'react';

interface FeedItem {
  type: string;
  data: any;
}

interface FeedResponse {
  data: FeedItem[];
  cursor: string | null;
  hasMore: boolean;
  limit: number;
}

function InfiniteScrollFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const url = cursor 
        ? `/api/crafto/home/v1.7?cursor=${cursor}&limit=20`
        : `/api/crafto/home/v1.7?limit=20`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${YOUR_TOKEN}`,
        },
      });
      
      const data: FeedResponse = await response.json();
      
      setItems(prev => [...prev, ...data.data]);
      setCursor(data.cursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial page
  useEffect(() => {
    loadMore();
  }, []);

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{/* Render your item */}</div>
      ))}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
      
      {!hasMore && <p>End of feed</p>}
    </div>
  );
}
```

### Auto-scroll Implementation

```typescript
import { useEffect, useRef } from 'react';

function useInfiniteScroll(loadMore: () => void, hasMore: boolean, loading: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, hasMore, loadMore]);

  return loadMoreRef;
}

// Usage:
function InfiniteScrollFeed() {
  // ... state management ...
  const loadMoreRef = useInfiniteScroll(loadMore, hasMore, loading);

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>{/* Render item */}</div>
      ))}
      <div ref={loadMoreRef} style={{ height: '20px' }} />
      {loading && <p>Loading...</p>}
    </div>
  );
}
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cursor` | string | No | Base64-encoded cursor for pagination (RECOMMENDED) |
| `offset` | string | No | Time-based offset in YYYYMMDDHH format (DEPRECATED) |
| `limit` | number | No | Items per page (default: 20, max: 100) |
| `category` | string | No | Filter by category type (e.g., "motivational", "funny") |

## Best Practices

1. **Always use `cursor` instead of `offset`** for new implementations
2. **Check `hasMore` before loading** to avoid unnecessary requests
3. **Store the cursor** from each response for the next request
4. **Handle loading states** to prevent duplicate requests
5. **Implement error handling** for network failures
6. **Use reasonable page sizes** (20-50 items recommended)
7. **Add debouncing** for scroll-triggered loads to avoid rapid requests

## Migration from Offset to Cursor

If you're currently using the `offset` parameter:

### Old Code:
```javascript
const url = `/api/crafto/home/v1.7?offset=${offset}&limit=20`;
```

### New Code:
```javascript
const url = cursor 
  ? `/api/crafto/home/v1.7?cursor=${cursor}&limit=20`
  : `/api/crafto/home/v1.7?limit=20`;
```

## Troubleshooting

### Issue: Getting duplicate items
**Solution:** Make sure you're using `cursor` instead of `offset`

### Issue: Items are skipped
**Solution:** Ensure you're passing the exact cursor from the previous response

### Issue: `hasMore` is always true
**Solution:** Check that your database has a finite number of items and the query is working correctly

### Issue: Cursor decode error
**Solution:** Don't modify the cursor string - pass it exactly as received from the API

## Technical Details

### Cursor Format
The cursor is a base64-encoded JSON object containing:
```json
{
  "timestamp": "2026-01-16T15:00:00.000Z",
  "id": 123
}
```

This ensures:
- Items are ordered by timestamp (newest first)
- Items with the same timestamp are ordered by ID
- No duplicates or gaps in pagination

### Database Query
The API uses the following logic:
1. If cursor provided: Get items where `(createdAt, id) < (cursor.timestamp, cursor.id)`
2. If offset provided: Get items where `createdAt <= offset`
3. Order by `createdAt DESC, id DESC`
4. Fetch `limit + 1` items to determine if more exist

## Support

For issues or questions, please contact the development team or create an issue in the project repository.
