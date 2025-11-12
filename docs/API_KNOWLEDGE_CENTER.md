# Knowledge Center API Documentation

## Overview

Knowledge Center API provides comprehensive functionality for managing knowledge center data with advanced pagination, sorting, and filtering capabilities.

**Endpoint:** `GET /api/v1/knowledge-centers`

**Controller Method:** `findAll()`

## Request Structure

The API accepts query parameters for pagination, ordering, and filtering:

```typescript
@Get()
async findAll(
  @Query() findManyDto: FindManyKnowledgeCenterDto,
  @Query() paginationDto: PaginateKnowledgeCenterDto,
) {
  return this.knowledgeCentersService.findAll(findManyDto, paginationDto);
}
```

## 📊 Pagination Parameters

Pagination controls which subset of data to return and how to navigate through large datasets.

### Base Parameters

| Parameter | Type   | Default | Min | Max | Description                 |
| --------- | ------ | ------- | --- | --- | --------------------------- |
| `page`    | number | 1       | 1   | -   | Page number (starts from 1) |
| `perPage` | number | 20      | 1   | 100 | Number of items per page    |

### Pagination Examples

```javascript
// Basic pagination
?page=1&perPage=20

// Get second page with 10 items per page
?page=2&perPage=10

// Get first page with maximum items
?page=1&perPage=100
```

### Query Parameter Generator

```javascript
function generatePaginationParams() {
  const page = Math.floor(Math.random() * 5) + 1; // Random page 1-5
  const perPage = [10, 20][Math.floor(Math.random() * 2)]; // Random perPage
  return `page=${page}&perPage=${perPage}`;
}

// Usage examples:
// "page=3&perPage=10"
// "page=1&perPage=20"
// "page=5&perPage=10"
```

## 🔄 Ordering Parameters

Ordering controls how the results are sorted. You can sort by multiple fields in sequence.

### Available Sort Fields

| Field         | Type     | Description                                                        |
| ------------- | -------- | ------------------------------------------------------------------ |
| `title`       | string   | Sort by knowledge center title                                     |
| `description` | string   | Sort by description                                                |
| `type`        | enum     | Sort by knowledge center type                                      |
| `viewCount`   | number   | Sort by view count                                                 |
| `likeCount`   | number   | Sort by like count                                                 |
| `createdAt`   | datetime | Sort by creation date (when knowledge center was created)          |
| `updatedAt`   | datetime | Sort by last update date (when knowledge center was last modified) |
| `publishedAt` | datetime | Sort by publication date (when knowledge center was published)     |

### Sort Direction

| Value  | Description                         |
| ------ | ----------------------------------- |
| `asc`  | Ascending (A-Z, 0-9, oldest first)  |
| `desc` | Descending (Z-A, 9-0, newest first) |

### Date-Based Ordering (Detailed Explanation)

Knowledge Center has three date fields that can be used for sorting, each serving different purposes:

#### 🗓️ **createdAt** - Creation Date

- **Purpose**: When the knowledge center was first created in the system
- **Use Case**: Show newest created content, track content creation trends
- **Common Sorting**: `desc` for newest first, `asc` for oldest first

#### 🔄 **updatedAt** - Last Update Date

- **Purpose**: When the knowledge center was last modified/updated
- **Use Case**: Show recently updated content, find fresh/maintained content
- **Common Sorting**: `desc` for recently updated first

#### 📅 **publishedAt** - Publication Date

- **Purpose**: When the knowledge center was officially published
- **Use Case**: Show published content in chronological order, schedule content
- **Note**: Can be `null` for unpublished content

### Date Ordering Examples

```javascript
// Sort by creation date (newest created first)
orderBy[0][createdAt]=desc

// Sort by creation date (oldest created first)
orderBy[0][createdAt]=asc

// Sort by last update (recently updated first)
orderBy[0][updatedAt]=desc

// Sort by publication date (most recently published first)
orderBy[0][publishedAt]=desc

// Sort by publication date (oldest published first)
orderBy[0][publishedAt]=asc

// Complex date sorting: recently updated, then by creation date
orderBy[0][updatedAt]=desc&orderBy[1][createdAt]=desc

// Published content sorted by publish date, then by creation date for tie-breaker
orderBy[0][publishedAt]=desc&orderBy[1][createdAt]=desc
```

### Date Field Comparison & Use Cases

| Scenario                  | Recommended Order                                       | Reason                             |
| ------------------------- | ------------------------------------------------------- | ---------------------------------- |
| **Show Newest Content**   | `orderBy[0][createdAt]=desc`                            | Most recently created content      |
| **Show Recently Updated** | `orderBy[0][updatedAt]=desc`                            | Content that's actively maintained |
| **Publish Schedule**      | `orderBy[0][publishedAt]=asc`                           | Chronological publication order    |
| **Content Freshness**     | `orderBy[0][updatedAt]=desc&orderBy[1][createdAt]=desc` | Updated first, then by creation    |
| **Draft Management**      | `orderBy[0][createdAt]=desc`                            | Track creation order of drafts     |

### Handling Null Published Dates

```javascript
// Note: publishedAt can be null for unpublished content
// When sorting by publishedAt, null values typically appear first or last
// depending on the database configuration

// To ensure published content appears first, you might need additional filtering
publishedAt[not]=null&orderBy[0][publishedAt]=desc

// Or to show only published content sorted by publish date
publishedAt[not]=null&orderBy[0][publishedAt]=desc&orderBy[1][createdAt]=desc
```

### Query Parameter Generator (Updated)

```javascript
function generateDateOrderByParams() {
  const dateOrderOptions = [
    'orderBy[0][createdAt]=desc', // Newest created first
    'orderBy[0][createdAt]=asc', // Oldest created first
    'orderBy[0][updatedAt]=desc', // Recently updated first
    'orderBy[0][updatedAt]=asc', // Least recently updated
    'orderBy[0][publishedAt]=desc', // Recently published first
    'orderBy[0][publishedAt]=asc', // Oldest published first
    'orderBy[0][updatedAt]=desc&orderBy[1][createdAt]=desc', // Updated then created
    'orderBy[0][publishedAt]=desc&orderBy[1][updatedAt]=desc', // Published then updated
  ];
  return dateOrderOptions[Math.floor(Math.random() * dateOrderOptions.length)];
}
```

### General Ordering Examples

```javascript
// Sort by creation date (newest first)
orderBy[0][createdAt]=desc

// Sort by title alphabetically
orderBy[0][title]=asc

// Sort by like count (highest first), then by title
orderBy[0][likeCount]=desc&orderBy[1][title]=asc

// Multiple field sorting with dates
orderBy[0][type]=asc&orderBy[1][createdAt]=desc&orderBy[2][title]=asc

// Content strategy: published, then by popularity, then by date
orderBy[0][publishedAt]=desc&orderBy[1][likeCount]=desc&orderBy[2][updatedAt]=desc
```

### Query Parameter Generator

```javascript
function generateOrderByParams() {
  const orderByOptions = [
    'orderBy[0][createdAt]=desc',
    'orderBy[0][createdAt]=asc',
    'orderBy[0][updatedAt]=desc',
    'orderBy[0][title]=asc',
    'orderBy[0][viewCount]=desc',
    'orderBy[0][createdAt]=desc&orderBy[1][title]=asc',
  ];
  return orderByOptions[Math.floor(Math.random() * orderByOptions.length)];
}

// Usage examples:
// "orderBy[0][createdAt]=desc"
// "orderBy[0][title]=asc"
// "orderBy[0][viewCount]=desc&orderBy[1][title]=asc"
```

## 🔍 Filtering Parameters (Where Clause)

Filtering allows you to narrow down results based on specific criteria.

### Available Filter Fields

| Field                 | Type     | Operators                                         | Description                     |
| --------------------- | -------- | ------------------------------------------------- | ------------------------------- |
| `id`                  | UUID     | equals, in, notIn, contains, startsWith, endsWith | Filter by knowledge center ID   |
| `createdBy`           | UUID     | equals, in, notIn, contains, startsWith, endsWith | Filter by creator ID            |
| `isKnowledgeCategory` | UUID     | equals, in, notIn, contains, startsWith, endsWith | Filter by knowledge category    |
| `title`               | string   | equals, in, notIn, contains, startsWith, endsWith | Filter by title                 |
| `description`         | string   | equals, in, notIn, contains, startsWith, endsWith | Filter by description           |
| `type`                | enum     | equals, in, notIn                                 | Filter by knowledge center type |
| `viewCount`           | number   | equals, gt, gte, lt, lte, in, notIn               | Filter by view count            |
| `likeCount`           | number   | equals, gt, gte, lt, lte, in, notIn               | Filter by like count            |
| `createdAt`           | datetime | equals, gt, gte, lt, lte, in, notIn               | Filter by creation date         |
| `updatedAt`           | datetime | equals, gt, gte, lt, lte, in, notIn               | Filter by last update date      |
| `publishedAt`         | datetime | equals, gt, gte, lt, lte, in, notIn               | Filter by publication date      |

### Filter Operators

| Operator     | Description                           | Example                           |
| ------------ | ------------------------------------- | --------------------------------- |
| `equals`     | Exact match                           | `title[equals]=JavaScript Basics` |
| `contains`   | Contains substring (case-insensitive) | `title[contains]=javascript`      |
| `startsWith` | Starts with (case-insensitive)        | `title[startsWith]=Intro`         |
| `endsWith`   | Ends with (case-insensitive)          | `title[endsWith]=Tutorial`        |
| `in`         | Matches any value in array            | `type[in]=course,general`         |
| `notIn`      | Doesn't match any value in array      | `type[notIn]=webinar`             |
| `gt`         | Greater than                          | `viewCount[gt]=100`               |
| `gte`        | Greater than or equal                 | `viewCount[gte]=50`               |
| `lt`         | Less than                             | `viewCount[lt]=1000`              |
| `lte`        | Less than or equal                    | `viewCount[lte]=500`              |

### Filtering Examples

````javascript
// Exact title match
title[equals]=JavaScript Fundamentals

// Title contains search (case-insensitive)
title[contains]=javascript

// Multiple title options
title[in]=JavaScript Basics,React Tutorial,Node.js Guide

// Exclude specific titles
title[notIn]=Deleted Content,Archived Material

// Type filtering
type=course
type[in]=course,general

// View count range
viewCount[gte]=50
viewCount[lte]=1000
viewCount[gt]=100&viewCount[lt]=500

// Like count filtering
likeCount[gte]=10

// Creator filtering
createdBy=123e4567-e89b-12d3-a456-426614174000
createdBy[in]=user1,user2,user3

// Date filtering examples (see detailed section below)
createdAt[gte]=2024-01-01
updatedAt[gt]=2024-06-01
publishedAt[not]=null

// Combined filtering
title[contains]=javascript&type=course&viewCount[gte]=100

### 🗓️ Date Filtering (Detailed Examples)

Date filtering allows you to filter knowledge centers based on when they were created, updated, or published.

#### **Date Format**
Use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`

#### **Creation Date Filtering (createdAt)**
```javascript
// Created on or after specific date
createdAt[gte]=2024-01-01

// Created before specific date
createdAt[lt]=2024-12-31

// Created within date range
createdAt[gte]=2024-01-01&createdAt[lte]=2024-12-31

// Created on specific date
createdAt[equals]=2024-06-15

// Created in June 2024
createdAt[gte]=2024-06-01&createdAt[lt]=2024-07-01

// Created this week
createdAt[gte]=2024-06-10&createdAt[lte]=2024-06-16
````

#### **Update Date Filtering (updatedAt)**

```javascript
// Recently updated (last 30 days)
updatedAt[gte]=2024-05-17

// Not updated recently (older than 90 days)
updatedAt[lt]=2024-03-19

// Updated today
updatedAt[gte]=2024-06-16

// Updated within specific range
updatedAt[gte]=2024-06-01&updatedAt[lte]=2024-06-15

// Updated this month
updatedAt[gte]=2024-06-01&updatedAt[lt]=2024-07-01
```

#### **Publication Date Filtering (publishedAt)**

```javascript
// Published content only
publishedAt[not]=null

// Published on or after specific date
publishedAt[gte]=2024-01-01

// Published before specific date
publishedAt[lt]=2024-12-31

// Published within date range
publishedAt[gte]=2024-01-01&publishedAt[lte]=2024-06-30

// Published today
publishedAt[equals]=2024-06-16

// Published this year
publishedAt[gte]=2024-01-01&publishedAt[lt]=2025-01-01
```

#### **Complex Date Filtering Scenarios**

```javascript
// Created this year but not published yet
createdAt[gte]=2024-01-01&publishedAt[equals]=null

// Recently updated old content (created before 2024, updated after 2024-01-01)
createdAt[lt]=2024-01-01&updatedAt[gte]=2024-01-01

// Published in last 30 days, sorted by publish date
publishedAt[gte]=2024-05-17&orderBy[0][publishedAt]=desc

// Content that hasn't been updated in 6 months
updatedAt[lt]=2023-12-16

// Created by specific user this month
createdBy=user-id&createdAt[gte]=2024-06-01&createdAt[lt]=2024-07-01

// Popular content created recently (high view count + recent creation)
createdAt[gte]=2024-01-01&viewCount[gte]=100&orderBy[0][viewCount]=desc
```

#### **Date Range Examples for Common Periods**

```javascript
// Today
createdAt[gte]=2024-06-16&createdAt[lt]=2024-06-17

// This week (assuming week starts on Monday)
createdAt[gte]=2024-06-10&createdAt[lt]=2024-06-17

// This month
createdAt[gte]=2024-06-01&createdAt[lt]=2024-07-01

// This quarter (Q2 2024)
createdAt[gte]=2024-04-01&createdAt[lt]=2024-07-01

// This year
createdAt[gte]=2024-01-01&createdAt[lt]=2025-01-01

// Last 7 days
updatedAt[gte]=2024-06-09

// Last 30 days
updatedAt[gte]=2024-05-17

// Last 90 days
updatedAt[gte]=2024-03-18

// Last 6 months
updatedAt[gte]=2023-12-16

// Last year
createdAt[gte]=2023-01-01&createdAt[lt]=2024-01-01
```

````

### Query Parameter Generator

```javascript
function generateWhereParams() {
  const whereOptions = [
    'title[contains]=test',
    'type=general',
    'type=course',
    'viewCount[gte]=5',
    'viewCount[lte]=100',
    'likeCount[gte]=10',
    'createdAt[gte]=2024-01-01',
    'createdBy=123e4567-e89b-12d3-a456-426614174000',
    'title[contains]=tutorial&type=course&viewCount[gte]=50'
  ];
  return whereOptions[Math.floor(Math.random() * whereOptions.length)];
}

// Usage examples:
// "title[contains]=javascript"
// "type=course&viewCount[gte]=100"
// "likeCount[gte]=10&title[contains]=tutorial"
````

## 🔗 Advanced Filtering (Nested Relations)

You can filter based on related data using nested queries.

### Webinar Filtering

```javascript
// Filter knowledge centers with webinars
webinar[some][title][contains]=React

// Filter knowledge centers with upcoming webinars
webinar[some][scheduledAt][gt]=2024-12-01T00:00:00Z

// Filter knowledge centers without webinars
webinar[none]={}
```

### Knowledge Content Filtering

```javascript
// Filter knowledge centers with specific content
knowledgeContent[some][title][contains] = JavaScript;

// Filter knowledge centers with published content
knowledgeContent[some][isPublished] = true;

// Filter knowledge centers with video content
knowledgeContent[some][type] = video;
```

## 📝 Complete Request Examples

### Example 1: Basic Pagination

```javascript
// Get first page, 20 items, sorted by creation date
GET /api/v1/knowledge-centers?page=1&perPage=20&orderBy[0][createdAt]=desc
```

### Example 2: Search and Filter

```javascript
// Search for JavaScript courses with high view counts
GET /api/v1/knowledge-centers?
  title[contains]=JavaScript&
  type=course&
  viewCount[gte]=100&
  orderBy[0][viewCount]=desc&
  orderBy[1][createdAt]=desc&
  page=1&
  perPage=10
```

### Example 3: Creator and Date Range

```javascript
// Get knowledge centers by specific creator created in 2024
GET /api/v1/knowledge-centers?
  createdBy=123e4567-e89b-12d3-a456-426614174000&
  createdAt[gte]=2024-01-01T00:00:00Z&
  createdAt[lte]=2024-12-31T23:59:59Z&
  orderBy[0][createdAt]=desc
```

### Example 4: Date-Based Content Strategy

```javascript
// Get recently updated content from this year, sorted by update date
GET /api/v1/knowledge-centers?
  updatedAt[gte]=2024-01-01T00:00:00Z&
  createdAt[gte]=2024-01-01T00:00:00Z&
  orderBy[0][updatedAt]=desc&
  orderBy[1][viewCount]=desc&
  page=1&
  perPage=20
```

### Example 5: Published Content with Date Filtering

```javascript
// Get published content from last 30 days, most popular first
GET /api/v1/knowledge-centers?
  publishedAt[not]=null&
  publishedAt[gte]=2024-05-17T00:00:00Z&
  viewCount[gte]=10&
  orderBy[0][publishedAt]=desc&
  orderBy[1][viewCount]=desc&
  page=1&
  perPage=15
```

### Example 6: Content Freshness Analysis

```javascript
// Find stale content (created 6+ months ago, not updated in 3+ months)
GET /api/v1/knowledge-centers?
  createdAt[lt]=2023-12-16T00:00:00Z&
  updatedAt[lt]=2024-03-17T00:00:00Z&
  orderBy[0][updatedAt]=asc&
  page=1&
  perPage=50
```

### Example 7: Complex Multi-field Query

```javascript
// Get popular course content with specific filters
GET /api/v1/knowledge-centers?
  type[in]=course,general&
  title[contains]=tutorial&
  viewCount[gte]=50&
  likeCount[gte]=10&
  createdAt[gte]=2024-01-01&
  orderBy[0][viewCount]=desc&
  orderBy[1][likeCount]=desc&
  orderBy[2][title]=asc&
  page=2&
  perPage=15
```

### Example 8: Nested Relation Filtering

```javascript
// Get knowledge centers with React webinars, published recently
GET /api/v1/knowledge-centers?
  webinar[some][title][contains]=React&
  publishedAt[gte]=2024-01-01&
  orderBy[0][publishedAt]=desc&
  orderBy[1][createdAt]=desc&
  page=1&
  perPage=20
```

### Example 9: Time-Sensitive Content Discovery

```javascript
// Find trending content from last 7 days with high engagement
GET /api/v1/knowledge-centers?
  createdAt[gte]=2024-06-09T00:00:00Z&
  viewCount[gte]=25&
  likeCount[gte]=5&
  type=course&
  orderBy[0][viewCount]=desc&
  orderBy[1][likeCount]=desc&
  orderBy[2][createdAt]=desc&
  page=1&
  perPage=10
```

## 🎯 Query Parameter Generator Functions

Here are the utility functions for generating test queries:

```javascript
// Query parameter generators for different scenarios
function generatePaginationParams() {
  const page = Math.floor(Math.random() * 5) + 1; // Random page 1-5
  const perPage = [10, 20][Math.floor(Math.random() * 2)]; // Random perPage
  return `page=${page}&perPage=${perPage}`;
}

function generateOrderByParams() {
  const orderByOptions = [
    'orderBy[0][createdAt]=desc',
    'orderBy[0][createdAt]=asc',
    'orderBy[0][updatedAt]=desc',
    'orderBy[0][title]=asc',
    'orderBy[0][viewCount]=desc',
    'orderBy[0][createdAt]=desc&orderBy[1][title]=asc',
  ];
  return orderByOptions[Math.floor(Math.random() * orderByOptions.length)];
}

function generateWhereParams() {
  const whereOptions = [
    'title[contains]=javascript',
    'type=general',
    'type=course',
    'viewCount[gte]=5',
    'viewCount[lte]=100',
    'likeCount[gte]=10',
    'createdBy=123e4567-e89b-12d3-a456-426614174000',
    'title[contains]=tutorial&type=course&viewCount[gte]=50',
    'createdAt[gte]=2024-01-01',
    'updatedAt[gte]=2024-06-01',
    'publishedAt[not]=null',
    'createdAt[gte]=2024-01-01&updatedAt[gte]=2024-06-01',
    'publishedAt[gte]=2024-01-01&publishedAt[lte]=2024-12-31',
    'title[contains]=javascript&createdAt[gte]=2024-01-01&viewCount[gte]=50',
  ];
  return whereOptions[Math.floor(Math.random() * whereOptions.length)];
}

// Generate complete query URL
function generateCompleteQuery() {
  const pagination = generatePaginationParams();
  const orderBy = generateOrderByParams();
  const where = generateWhereParams();

  return `/api/v1/knowledge-centers?${pagination}&${orderBy}&${where}`;
}

// Example outputs:
// "/api/v1/knowledge-centers?page=3&perPage=10&orderBy[0][createdAt]=desc&title[contains]=javascript"
// "/api/v1/knowledge-centers?page=1&perPage=20&orderBy[0][viewCount]=desc&type=course&viewCount[gte]=5"
// "/api/v1/knowledge-centers?page=2&perPage=10&orderBy[0][title]=asc&likeCount[gte]=10"
```

## 📊 Response Format

The API returns a paginated response with the following structure:

```typescript
{
  "success": true,
  "status": 200,
  "message": "Knowledge centers retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "createdBy": "456e7890-e89b-12d3-a456-426614174001",
      "subject": "Mathematics",
      "title": "Calculus Fundamentals",
      "description": "Learn the basics of calculus",
      "penyelenggara": "Math Department",
      "thumbnail": "https://example.com/calculus.jpg",
      "type": "course",
      "viewCount": 1250,
      "likeCount": 89,
      "isFinal": true,
      "publishedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T14:30:00Z",
      "webinar": { /* webinar data */ },
      "knowledgeContent": { /* content data */ }
    }
    // ... more items
  ],
  "pageMeta": {
    "page": 1,
    "perPage": 20,
    "total": 150,
    "totalPageCount": 8,
    "hasNext": true,
    "hasPrev": false,
    "showingFrom": 1,
    "showingTo": 20,
    "resultCount": 20,
    "totalResultCount": 150
  }
}
```

### Response Fields

| Field      | Type    | Description                       |
| ---------- | ------- | --------------------------------- |
| `success`  | boolean | Operation success status          |
| `status`   | number  | HTTP status code                  |
| `message`  | string  | Success message                   |
| `data`     | array   | Array of knowledge center objects |
| `pageMeta` | object  | Pagination metadata               |

### Page Metadata Fields

| Field              | Type    | Description                       |
| ------------------ | ------- | --------------------------------- |
| `page`             | number  | Current page number               |
| `perPage`          | number  | Items per page                    |
| `total`            | number  | Total items available             |
| `totalPageCount`   | number  | Total pages available             |
| `hasNext`          | boolean | Has next page                     |
| `hasPrev`          | boolean | Has previous page                 |
| `showingFrom`      | number  | First item number on current page |
| `showingTo`        | number  | Last item number on current page  |
| `resultCount`      | number  | Items on current page             |
| `totalResultCount` | number  | Total items in database           |

## 🚀 Performance Tips

1. **Use Specific Filters**: More specific filters reduce database load
2. **Limit Page Size**: Use reasonable `perPage` values (10-50 recommended)
3. **Index Optimization**: Frequently filtered fields should be indexed
4. **Avoid Deep Nesting**: Limit nested relation filters for better performance
5. **Use Pagination**: Always use pagination for large datasets

## 🔒 Error Handling

Common error responses:

```typescript
// Validation Error (400)
{
  "success": false,
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "page",
      "message": "page must be a positive integer"
    }
  ]
}

// Not Found (404)
{
  "success": false,
  "status": 404,
  "message": "No knowledge centers found matching the criteria"
}
```

## 📝 Summary

The Knowledge Center API provides powerful querying capabilities with:

- ✅ **Flexible Pagination**: Navigate through large datasets efficiently
- ✅ **Multi-field Sorting**: Sort by multiple fields in custom order
- ✅ **Advanced Filtering**: Filter by any field with various operators
- ✅ **Nested Relations**: Filter based on related data
- ✅ **Type Safety**: Full TypeScript support with Prisma
- ✅ **Performance Optimized**: Efficient database queries with proper indexing

This comprehensive API enables sophisticated data retrieval scenarios while maintaining clean, maintainable code structure.
