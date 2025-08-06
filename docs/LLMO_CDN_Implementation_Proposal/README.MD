# LLMO CDN Implementation Proposal
## AI/LLM Optimization at the Edge

---

## Summary

This proposal outlines two primary approaches for implementing LLMO (Large Language Model Optimization) at the CDN level to enhance AI/LLM visibility and agentic traffic. The implementation will focus on dynamically injecting AI-optimized meta tags and JSON-LD structured data into web pages at the edge, ensuring optimal visibility for AI crawlers and LLM consumption.

### Key Objectives
- Enhance AI/LLM visibility without affecting user experience
- Implement zero-invasive content manipulation at the edge
- Provide flexible deployment options for different customer requirements
- Ensure SEO compliance and avoid cloaking risks
- Minimize operational overhead and COGS

---

## Approach Selection Rationale

### Rejected Options (Adobe-Managed Services)

We have deliberately excluded the following Adobe-managed approaches to minimize operational overhead and COGS:

1. **Outer CDN Proxy-Over** - Requires Adobe to manage customer traffic, increasing operational complexity
2. **Self-Hosted Reverse Proxy at Provider PoPs** - Requires Adobe infrastructure management and monitoring
3. **Managed Web Accelerator** - Full Adobe-managed service with high operational costs

### Selected Approaches

**Primary Focus:** ESI (Edge Side Includes) and Edge Worker implementations
- Customer-controlled deployment
- Minimal Adobe operational overhead
- Flexible implementation options
- Reduced COGS impact

---

## Approach 1: ESI (Edge Side Includes) Implementation

### Overview
ESI-based implementation leverages Edge Side Includes to dynamically inject AI-optimized content fragments into web pages at the CDN level.

### Architecture Flow

```
Client Request → CDN → Customer Origin (AEM) → HTML with ESI Tags → CDN Processes ESI → 
Fetch Fragments from Adobe LLMO Platform → Assemble Final HTML → Serve to Client
```

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   CDN           │    │   Customer      │
│   (Browser/Bot) │    │   (Akamai/      │    │   AEM Origin    │
│                 │    │    Fastly)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Request           │                       │
         │─────────────────────▶│                       │
         │                       │                       │
         │                       │ 2. Fetch HTML         │
         │                       │─────────────────────▶│
         │                       │                       │
         │                       │ 3. HTML with ESI     │
         │                       │◀──────────────────────│
         │                       │   <esi:include>      │
         │                       │                       │
         │                       │ 4. Process ESI       │
         │                       │                       │
         │                       │ 5. Fetch Fragment    │
         │                       │─────────────────────▶│
         │                       │   (Adobe LLMO        │
         │                       │    Platform)          │
         │                       │                       │
         │                       │ 6. Fragment Response │
         │                       │◀──────────────────────│
         │                       │                       │
         │                       │ 7. Assemble HTML     │
         │                       │                       │
         │ 8. Final HTML         │                       │
         │◀──────────────────────│                       │
         │                       │                       │
```

### Implementation Steps

#### 1. Customer Template Modification
Add ESI include tags to HTML templates:

```html
<!-- In head.html or main template -->
<esi:include src="/fragments/head_metadata_current.html"/>
<esi:include src="/fragments/body_enhancement_current.html"/>
```

#### 2. CDN Configuration

**Akamai Configuration:**
```json
{
  "behaviors": [
    {
      "name": "esi",
      "options": {
        "enable": true,
        "enableXmlProcessing": false
      }
    }
  ],
  "rules": [
    {
      "name": "Fragment Routing",
      "criteria": [
        {
          "name": "path",
          "options": {
            "matchOperator": "MATCHES_ONE_OF",
            "values": ["/fragments/*_current.html"]
          }
        }
      ],
      "behaviors": [
        {
          "name": "origin",
          "options": {
            "originType": "CUSTOMER",
            "hostname": "llmo-edge.adobe.com",
            "port": 443,
            "protocol": "HTTPS"
          }
        }
      ]
    },
    {
      "name": "Main Content Routing",
      "criteria": [
        {
          "name": "path",
          "options": {
            "matchOperator": "DOES_NOT_MATCH_ONE_OF",
            "values": ["/fragments/*"]
          }
        }
      ],
      "behaviors": [
        {
          "name": "origin",
          "options": {
            "originType": "CUSTOMER",
            "hostname": "customer-aem.example.com",
            "port": 443,
            "protocol": "HTTPS"
          }
        }
      ]
    }
  ]
}
```

**Fastly VCL Configuration:**
```vcl
vcl 4.0;

import std;

# Backend for Adobe LLMO Platform (fragments)
backend adobe_llmo_platform {
    .host = "llmo-edge.adobe.com";
    .port = "443";
    .ssl = true;
    .ssl_sni_hostname = "llmo-edge.adobe.com";
    .connect_timeout = 5s;
    .first_byte_timeout = 10s;
    .between_bytes_timeout = 10s;
}

# Backend for customer AEM origin (main content)
backend customer_aem_origin {
    .host = "customer-aem.example.com";
    .port = "443";
    .ssl = true;
    .connect_timeout = 5s;
    .first_byte_timeout = 10s;
    .between_bytes_timeout = 10s;
}

sub vcl_recv {
    # Route fragment requests to Adobe LLMO Platform
    if (req.url ~ "^/fragments/.*_current\.html$") {
        set req.backend_hint = adobe_llmo_platform;
        unset req.http.Accept-Encoding;
        set req.http.X-Fragment-Request = "true";
        return (pass);
    }
    
    # Route all other requests to customer AEM origin
    set req.backend_hint = customer_aem_origin;
}

sub vcl_backend_response {
    # Enable ESI processing for HTML responses
    if (bereq.http.X-Fragment-Request) {
        set beresp.do_esi = true;
        set beresp.ttl = 300s; # 5 minutes TTL for fragments
        set beresp.http.Surrogate-Control = "max-age=300";
    }
    
    # Enable ESI for main HTML pages from customer origin
    if (beresp.http.content-type ~ "text/html") {
        set beresp.do_esi = true;
    }
}

sub vcl_deliver {
    # Add headers for monitoring
    if (req.http.X-Fragment-Request) {
        set resp.http.X-ESI-Fragment = "true";
        set resp.http.X-ESI-Version = "v1.0";
        set resp.http.X-ESI-Provider = "Adobe-LLMO";
    }
}
```

#### 3. Fragment Hosting Structure

**Adobe LLMO Platform Fragment Example (`/fragments/head_metadata_current.html`):**
```html
<!-- Adobe LLMO Platform - AI-Optimized Meta Tags -->
<!-- Generated dynamically based on page content and AI optimization rules -->
<meta name="description" content="Enhanced description for AI crawlers" />
<meta name="keywords" content="ai, llm, structured data" />
<meta name="robots" content="index, follow, max-snippet:-1" />

<!-- Open Graph Tags for Social AI -->
<meta property="og:title" content="Enhanced Title for AI Consumption" />
<meta property="og:description" content="Enhanced description for AI understanding" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com" />

<!-- Twitter Card Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Enhanced Title for AI Consumption" />
<meta name="twitter:description" content="Enhanced description for AI crawlers" />

<!-- JSON-LD Structured Data for Enhanced AI Understanding -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Enhanced Page Title",
  "description": "Enhanced description for AI consumption",
  "url": "https://example.com",
  "mainEntity": {
    "@type": "Article",
    "headline": "Enhanced Article Headline",
    "description": "Enhanced article description for AI crawlers",
    "author": {
      "@type": "Organization",
      "name": "Your Organization"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Organization",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    },
    "datePublished": "2024-01-01T00:00:00Z",
    "dateModified": "2024-01-01T00:00:00Z"
  },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://example.com"
      }
    ]
  }
}
</script>

<!-- Adobe LLMO Platform Tracking -->
<meta name="ai:enhanced" content="true" />
<meta name="ai:version" content="v1.0" />
<meta name="ai:provider" content="Adobe-LLMO" />
<meta name="ai:last_updated" content="2024-01-01T00:00:00Z" />
```

### Advantages
- ✅ Minimal template changes required
- ✅ Version-controlled fragments managed by Adobe
- ✅ Easy rollback mechanism
- ✅ No cloaking risks (same content for all User-Agents)
- ✅ CDN-native caching benefits
- ✅ Zero-invasive by default
- ✅ Customer maintains control of primary content
- ✅ Adobe manages AI optimization fragments

### Disadvantages
- ❌ Requires CDN ESI support
- ❌ Limited to HTML fragments
- ❌ Additional network hop for fragment fetching
- ❌ Dependency on Adobe LLMO Platform availability

---

## Approach 2: Edge Worker Implementation

### Overview
Edge Worker-based implementation uses custom JavaScript code running at the CDN edge to dynamically modify HTML content and inject AI-optimized meta tags and structured data.

### Architecture Flow

```
Client Request → CDN Edge Worker → Fetch Original HTML → 
Call LLMO API for Enhancements → Inject Enhanced Content → Serve Modified HTML
```

### Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   CDN Edge      │    │   Customer      │
│   (Browser/Bot) │    │   Worker        │    │   AEM Origin    │
│                 │    │   (JavaScript)  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Request           │                       │
         │─────────────────────▶│                       │
         │                       │                       │
         │                       │ 2. Fetch Original     │
         │                       │   HTML                │
         │                       │─────────────────────▶│
         │                       │                       │
         │                       │ 3. Original HTML      │
         │                       │◀──────────────────────│
         │                       │                       │
         │                       │ 4. Call Adobe LLMO    │
         │                       │   Platform API        │
         │                       │─────────────────────▶│
         │                       │   (Adobe LLMO         │
         │                       │    Platform)          │
         │                       │                       │
         │                       │ 5. Enhancement Data   │
         │                       │◀──────────────────────│
         │                       │                       │
         │                       │ 6. Inject & Modify    │
         │                       │   HTML                │
         │                       │                       │
         │ 7. Enhanced HTML      │                       │
         │◀──────────────────────│                       │
         │                       │                       │
```

### Implementation Examples

#### Akamai Edge Worker (JavaScript)

```javascript
// Akamai Edge Worker for LLMO Enhancement
// Fetches content from customer AEM origin and enhances with Adobe LLMO Platform
export async function onClientRequest(request) {
    // Only process HTML responses
    if (!request.getHeader('Accept').includes('text/html')) {
        return;
    }
    
    // Set timeout for LLMO API call
    const timeout = 100; // 100ms timeout
    
    try {
        // Fetch original HTML from customer AEM origin
        const originResponse = await fetch(request.url, {
            cf: { cacheTtl: 300 },
            timeout: timeout
        });
        
        if (!originResponse.ok) {
            return; // Fallback to original response
        }
        
        const originalHtml = await originResponse.text();
        
        // Call Adobe LLMO Platform API for enhancements
        const llmoResponse = await fetch('https://llmo-api.adobe.com/enhance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + request.getVariable('LLMO_API_KEY'),
                'X-LLMO-Client': 'akamai-edge-worker'
            },
            body: JSON.stringify({
                url: request.url,
                html: originalHtml,
                userAgent: request.getHeader('User-Agent'),
                customerId: request.getVariable('CUSTOMER_ID')
            }),
            timeout: timeout
        });
        
        if (!llmoResponse.ok) {
            return; // Fallback to original response
        }
        
        const enhancements = await llmoResponse.json();
        
        // Inject enhancements into HTML
        const enhancedHtml = injectEnhancements(originalHtml, enhancements);
        
        // Return enhanced HTML
        request.respondWith(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'X-LLMO-Enhanced': 'true',
            'X-LLMO-Version': 'v1.0',
            'X-LLMO-Provider': 'Adobe-LLMO'
        }, enhancedHtml);
        
    } catch (error) {
        // Log error and fallback to original response
        console.log('LLMO Worker Error:', error.message);
        return; // Continue with original request
    }
}

function injectEnhancements(html, enhancements) {
    let enhancedHtml = html;
    
    // Inject meta tags in head
    if (enhancements.metaTags) {
        const headEndIndex = enhancedHtml.indexOf('</head>');
        if (headEndIndex !== -1) {
            enhancedHtml = enhancedHtml.slice(0, headEndIndex) + 
                          enhancements.metaTags + 
                          enhancedHtml.slice(headEndIndex);
        }
    }
    
    // Inject JSON-LD structured data
    if (enhancements.structuredData) {
        const headEndIndex = enhancedHtml.indexOf('</head>');
        if (headEndIndex !== -1) {
            enhancedHtml = enhancedHtml.slice(0, headEndIndex) + 
                          '<script type="application/ld+json">' + 
                          JSON.stringify(enhancements.structuredData) + 
                          '</script>' + 
                          enhancedHtml.slice(headEndIndex);
        }
    }
    
    return enhancedHtml;
}
```

#### Fastly Edge Worker (JavaScript)

```javascript
// Fastly Edge Worker for LLMO Enhancement
// Fetches content from customer AEM origin and enhances with Adobe LLMO Platform
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    // Only process HTML requests
    if (!request.headers.get('Accept').includes('text/html')) {
        return fetch(request);
    }
    
    try {
        // Fetch original HTML from customer AEM origin
        const originalResponse = await fetch(request);
        const originalHtml = await originalResponse.text();
        
        // Call Adobe LLMO Platform API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 100); // 100ms timeout
        
        const llmoResponse = await fetch('https://llmo-api.adobe.com/enhance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + LLMO_API_KEY,
                'X-LLMO-Client': 'fastly-edge-worker'
            },
            body: JSON.stringify({
                url: request.url,
                html: originalHtml,
                userAgent: request.headers.get('User-Agent'),
                customerId: CUSTOMER_ID
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!llmoResponse.ok) {
            return originalResponse; // Fallback
        }
        
        const enhancements = await llmoResponse.json();
        const enhancedHtml = injectEnhancements(originalHtml, enhancements);
        
        // Return enhanced response
        return new Response(enhancedHtml, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-LLMO-Enhanced': 'true',
                'X-LLMO-Version': 'v1.0',
                'X-LLMO-Provider': 'Adobe-LLMO'
            }
        });
        
    } catch (error) {
        // Log error and return original response
        console.log('LLMO Worker Error:', error.message);
        return fetch(request);
    }
}

function injectEnhancements(html, enhancements) {
    let enhancedHtml = html;
    
    // Inject meta tags
    if (enhancements.metaTags) {
        const headEndIndex = enhancedHtml.indexOf('</head>');
        if (headEndIndex !== -1) {
            enhancedHtml = enhancedHtml.slice(0, headEndIndex) + 
                          enhancements.metaTags + 
                          enhancedHtml.slice(headEndIndex);
        }
    }
    
    // Inject structured data
    if (enhancements.structuredData) {
        const headEndIndex = enhancedHtml.indexOf('</head>');
        if (headEndIndex !== -1) {
            enhancedHtml = enhancedHtml.slice(0, headEndIndex) + 
                          '<script type="application/ld+json">' + 
                          JSON.stringify(enhancements.structuredData) + 
                          '</script>' + 
                          enhancedHtml.slice(headEndIndex);
        }
    }
    
    return enhancedHtml;
}
```

### Advantages
- ✅ Full control over content manipulation
- ✅ Real-time enhancement generation
- ✅ No additional network hops
- ✅ Works with any CDN supporting edge workers
- ✅ Dynamic content adaptation

### Disadvantages
- ❌ Higher complexity and potential for errors
- ❌ Requires API calls to LLMO service
- ❌ Potential latency impact
- ❌ More complex debugging and monitoring

---

## Architecture Comparison

### Side-by-Side Architecture Comparison

| Aspect | ESI Approach | Edge Worker Approach |
|--------|-------------|---------------------|
| **Primary Content Source** | Customer AEM Origin | Customer AEM Origin |
| **Enhancement Source** | Adobe LLMO Platform Fragments | Adobe LLMO Platform API |
| **Processing Location** | CDN ESI Engine | CDN Edge Worker |
| **Caching Strategy** | Fragment-level caching | Full page caching |
| **Error Handling** | Graceful fallback to original | Graceful fallback to original |
| **Deployment Complexity** | Low (template changes only) | Medium (worker deployment) |
| **Monitoring** | Standard CDN monitoring | Advanced worker monitoring |

### Visual Comparison

**ESI Approach - Fragment-Based Enhancement:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   CDN       │    │  Customer   │    │   Adobe     │
│             │    │   ESI       │    │   AEM       │    │   LLMO      │
│             │    │   Engine    │    │   Origin    │    │  Platform   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Request       │                   │                   │
       │─────────────────▶│                   │                   │
       │                   │ 2. Fetch HTML    │                   │
       │                   │─────────────────▶│                   │
       │                   │                   │                   │
       │                   │ 3. HTML + ESI    │                   │
       │                   │◀──────────────────│                   │
       │                   │                   │                   │
       │                   │ 4. Fetch Fragment│                   │
       │                   │─────────────────────────────────────▶│
       │                   │                   │                   │
       │                   │ 5. Fragment      │                   │
       │                   │◀─────────────────────────────────────│
       │                   │                   │                   │
       │ 6. Assembled HTML │                   │                   │
       │◀──────────────────│                   │                   │
```

**Edge Worker Approach - API-Based Enhancement:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   CDN Edge  │    │  Customer   │    │   Adobe     │
│             │    │   Worker    │    │   AEM       │    │   LLMO      │
│             │    │             │    │   Origin    │    │  Platform   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Request       │                   │                   │
       │─────────────────▶│                   │                   │
       │                   │ 2. Fetch HTML    │                   │
       │                   │─────────────────▶│                   │
       │                   │                   │                   │
       │                   │ 3. Original HTML │                   │
       │                   │◀──────────────────│                   │
       │                   │                   │                   │
       │                   │ 4. Call API      │                   │
       │                   │─────────────────────────────────────▶│
       │                   │                   │                   │
       │                   │ 5. Enhancement   │                   │
       │                   │◀─────────────────────────────────────│
       │                   │                   │                   │
       │ 6. Enhanced HTML  │                   │                   │
       │◀──────────────────│                   │                   │
```

### Key Differences Summary

| Characteristic | ESI Approach | Edge Worker Approach |
|----------------|-------------|---------------------|
| **Content Assembly** | CDN assembles fragments | Worker modifies HTML |
| **Caching Granularity** | Fragment + Page level | Page level only |
| **Real-time Processing** | Limited | Full control |
| **Error Isolation** | Fragment-level | Page-level |
| **Deployment Speed** | Fast (template only) | Medium (worker code) |
| **Monitoring Complexity** | Low | High |
| **Adobe Platform Dependency** | Fragment availability | API availability |

---

## Content Update Mechanisms and TTL Strategies

### Content Update Architecture

Both approaches require different content update strategies for main HTML (customer AEM) and fragment/API content (Adobe LLMO Platform).

### ESI Approach - Content Update Strategy

#### Main HTML Content (Customer AEM Origin)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   CDN           │    │   End Users     │
│   AEM Authoring │    │   (Akamai/      │    │   (Browsers/    │
│   Instance      │    │    Fastly)      │    │    Bots)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Content Update    │                       │
         │   (Authoring)        │                       │
         │                       │                       │
         │ 2. Publish to        │                       │
         │   AEM Publisher      │                       │
         │                       │                       │
         │ 3. CDN Cache         │                       │
         │   Invalidation       │                       │
         │─────────────────────▶│                       │
         │                       │                       │
         │ 4. Fresh Content     │                       │
         │   Served             │                       │
         │                       │─────────────────────▶│
```

#### Fragment Content (Adobe LLMO Platform)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Adobe LLMO    │    │   CDN           │    │   End Users     │
│   Platform      │    │   (Akamai/      │    │   (Browsers/    │
│   (Fragments)   │    │    Fastly)      │    │    Bots)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Fragment Update   │                       │
         │   (AI Optimization)  │                       │
         │                       │                       │
         │ 2. Version Update    │                       │
         │   (current → vN)     │                       │
         │                       │                       │
         │ 3. CDN Cache         │                       │
         │   Invalidation       │                       │
         │─────────────────────▶│                       │
         │                       │                       │
         │ 4. Fresh Fragment    │                       │
         │   Served             │                       │
         │                       │─────────────────────▶│
```

### Edge Worker Approach - Content Update Strategy

#### Main HTML Content (Customer AEM Origin)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │   CDN Edge      │    │   End Users     │
│   AEM Authoring │    │   Worker        │    │   (Browsers/    │
│   Instance      │    │   (JavaScript)  │    │    Bots)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Content Update    │                       │
         │   (Authoring)        │                       │
         │                       │                       │
         │ 2. Publish to        │                       │
         │   AEM Publisher      │                       │
         │                       │                       │
         │ 3. CDN Cache         │                       │
         │   Invalidation       │                       │
         │─────────────────────▶│                       │
         │                       │                       │
         │ 4. Fresh Content     │                       │
         │   Served             │                       │
         │                       │─────────────────────▶│
```

#### API Content (Adobe LLMO Platform)
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Adobe LLMO    │    │   CDN Edge      │    │   End Users     │
│   Platform      │    │   Worker        │    │   (Browsers/    │
│   (API)         │    │   (JavaScript)  │    │    Bots)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. API Enhancement   │                       │
         │   Update             │                       │
         │                       │                       │
         │ 2. Worker Cache      │                       │
         │   Invalidation       │                       │
         │                       │                       │
         │ 3. Fresh API         │                       │
         │   Response           │                       │
         │◀─────────────────────│                       │
         │                       │                       │
         │ 4. Enhanced Content  │                       │
         │   Served             │                       │
         │                       │─────────────────────▶│
```

### TTL (Time-To-Live) Recommendations

#### ESI Approach TTL Strategy

| Content Type | TTL Duration | Invalidation Method | Rationale |
|--------------|-------------|-------------------|-----------|
| **Main HTML (Customer AEM)** | 1-4 hours | Manual/Automatic purge | Balance between freshness and performance |
| **Fragments (Adobe LLMO)** | 5-15 minutes | Version-based URLs | Frequent AI optimization updates |
| **Static Assets** | 24 hours | Cache headers | Stable content, high performance |

#### Edge Worker Approach TTL Strategy

| Content Type | TTL Duration | Invalidation Method | Rationale |
|--------------|-------------|-------------------|-----------|
| **Main HTML (Customer AEM)** | 1-4 hours | Manual/Automatic purge | Balance between freshness and performance |
| **API Responses (Adobe LLMO)** | 5-15 minutes | Worker cache invalidation | Frequent AI optimization updates |
| **Worker Code** | 1 hour | Worker deployment | Code updates and bug fixes |

### Content Update Mechanisms

#### 1. Main HTML Content Updates (Customer AEM)

**Update Frequency:** Based on customer publishing schedule
**Update Method:** Standard AEM publishing workflow

```javascript
// AEM Publishing Workflow
1. Author creates/updates content in AEM Authoring
2. Content is reviewed and approved
3. Content is published to AEM Publisher
4. CDN cache is invalidated via:
   - Manual purge through CDN dashboard
   - Automatic purge via AEM publishing hooks
   - Scheduled purge for time-sensitive content
```

**CDN Configuration for Main HTML:**
```vcl
# Fastly VCL for Main HTML Caching
sub vcl_backend_response {
    if (bereq.url ~ "^/(?!fragments/).*\.html$") {
        # Main HTML content - longer TTL
        set beresp.ttl = 14400s; # 4 hours
        set beresp.http.Cache-Control = "public, max-age=14400";
        
        # Enable ESI processing
        set beresp.do_esi = true;
    }
}
```

#### 2. Fragment Content Updates (Adobe LLMO Platform)

**Update Frequency:** Every 5-15 minutes based on AI optimization
**Update Method:** Version-based URL updates

```javascript
// Adobe LLMO Platform Fragment Update Process
1. AI analyzes page content and generates new optimizations
2. New fragment version is created (v1, v2, v3, etc.)
3. Alias mapping is updated: /fragments/head_metadata_current.html → v3
4. CDN cache is purged for fragment paths
5. New fragments are served immediately
```

**Fragment Versioning Strategy:**
```html
<!-- Fragment URL Structure -->
/fragments/head_metadata_v1.html  (Old version)
/fragments/head_metadata_v2.html  (New version)
/fragments/head_metadata_current.html  (Alias - always points to latest)
```

**CDN Configuration for Fragments:**
```vcl
# Fastly VCL for Fragment Caching
sub vcl_backend_response {
    if (bereq.url ~ "^/fragments/.*_current\.html$") {
        # Fragment content - shorter TTL
        set beresp.ttl = 300s; # 5 minutes
        set beresp.http.Surrogate-Control = "max-age=300";
        set beresp.http.Cache-Control = "public, max-age=300";
        
        # Enable ESI processing
        set beresp.do_esi = true;
    }
}
```

#### 3. Edge Worker API Updates (Adobe LLMO Platform)

**Update Frequency:** Real-time based on page content
**Update Method:** API response caching with TTL

```javascript
// Edge Worker Cache Strategy
const CACHE_TTL = {
    mainHtml: 14400,    // 4 hours
    apiResponse: 300,    // 5 minutes
    workerCode: 3600     // 1 hour
};

// Cache invalidation triggers
1. Main HTML changes → Purge main HTML cache
2. AI optimization updates → Purge API response cache
3. Worker code updates → Deploy new worker version
```

### Cache Invalidation Strategies

#### 1. Manual Invalidation
```bash
# Akamai Cache Invalidation
curl -X POST "https://api.akamai.com/ccu/v3/invalidate/url/production" \
  -H "Authorization: Bearer $AKAMAI_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "objects": [
      "https://example.com/page.html",
      "https://example.com/fragments/*"
    ]
  }'

# Fastly Cache Invalidation
curl -X POST "https://api.fastly.com/service/$SERVICE_ID/purge" \
  -H "Fastly-Key: $FASTLY_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "surrogate_keys": ["main-content", "fragments"]
  }'
```

#### 2. Automatic Invalidation
```javascript
// AEM Publishing Hook for Automatic Invalidation
@Component(service = EventHandler.class)
public class CDNInvalidationHandler implements EventHandler<ReplicationEvent> {
    
    @Override
    public void handleEvent(ReplicationEvent event) {
        if (event.getType() == ReplicationActionType.ACTIVATE) {
            // Trigger CDN cache invalidation
            invalidateCDNCache(event.getPath());
        }
    }
    
    private void invalidateCDNCache(String path) {
        // Call CDN API to invalidate specific paths
        // Implementation varies by CDN provider
    }
}
```

#### 3. Scheduled Invalidation
```javascript
// Scheduled Cache Invalidation for Time-Sensitive Content
const SCHEDULED_INVALIDATION = {
    'news-articles': '0 */2 * * *',     // Every 2 hours
    'product-pages': '0 */4 * * *',     // Every 4 hours
    'static-content': '0 0 * * *'       // Daily
};

// Cron job to trigger invalidations
setInterval(() => {
    checkScheduledInvalidations();
}, 60000); // Check every minute
```

### Monitoring and Alerting

#### Cache Hit Ratio Monitoring
```javascript
// Cache Performance Metrics
const CACHE_METRICS = {
    mainHtmlHitRatio: '> 95%',
    fragmentHitRatio: '> 90%',
    apiResponseHitRatio: '> 85%',
    invalidationLatency: '< 30 seconds'
};

// Alerting Rules
if (cacheHitRatio < threshold) {
    sendAlert('Cache hit ratio below threshold');
}

if (invalidationLatency > 30) {
    sendAlert('Cache invalidation taking too long');
}
```

### Best Practices Summary

#### For Main HTML Content:
- **TTL:** 1-4 hours based on content update frequency
- **Invalidation:** Manual purge + automatic publishing hooks
- **Monitoring:** Cache hit ratio, invalidation latency
- **Fallback:** Serve stale content if invalidation fails

#### For Fragment/API Content:
- **TTL:** 5-15 minutes for frequent AI updates
- **Invalidation:** Version-based URLs + cache purge
- **Monitoring:** Fragment availability, API response times
- **Fallback:** Serve empty fragments if Adobe platform unavailable

#### For Edge Worker Code:
- **TTL:** 1 hour for code updates
- **Invalidation:** Worker deployment
- **Monitoring:** Worker error rates, execution times
- **Fallback:** Graceful degradation to original content

---

## SEO and GEO Optimization Risks

### Potential Issues with CDN-Level Content Manipulation

#### 1. Cloaking Detection Risk
**Risk:** Serving different content to different User-Agents
- **Mitigation:** Ensure identical content for all User-Agents
- **Implementation:** Use same enhancement logic for all requests

#### 2. Content Consistency Issues
**Risk:** Discrepancies between cached and live content
- **Mitigation:** Implement proper cache invalidation strategies
- **Implementation:** Use cache headers and version-based URLs

#### 3. Structured Data Validation
**Risk:** Invalid JSON-LD causing SEO penalties
- **Mitigation:** Validate structured data before injection
- **Implementation:** Use Google's Rich Results Test API

#### 4. Performance Impact
**Risk:** Increased page load times affecting Core Web Vitals
- **Mitigation:** Implement strict timeouts and fallback mechanisms
- **Implementation:** 100ms timeout with graceful degradation

#### 5. Crawler Confusion
**Risk:** Search engines detecting artificial content manipulation
- **Mitigation:** Ensure enhancements add value without deception
- **Implementation:** Focus on legitimate AI optimization, not keyword stuffing

### Recommended Safeguards

1. **Timeout Protection:** 100ms maximum processing time
2. **Error Handling:** Graceful fallback to original content
3. **Monitoring:** Real-time error rate and performance tracking
4. **Validation:** Structured data validation before injection
5. **Audit Trail:** Logging of all enhancements for compliance

---

## Implementation Recommendations

### Phase 1: ESI Implementation (Recommended)
**Timeline:** 4-6 weeks
**Rationale:** Lower risk, easier implementation, proven technology

**Steps:**
1. Set up fragment hosting infrastructure
2. Configure CDN ESI support
3. Implement fragment versioning system
4. Deploy monitoring and alerting
5. Pilot with select pages

### Phase 2: Edge Worker Implementation (Optional)
**Timeline:** 8-10 weeks
**Rationale:** Higher complexity but more flexibility

**Steps:**
1. Develop and test edge worker code
2. Implement LLMO API integration
3. Set up comprehensive monitoring
4. Deploy with strict fallback mechanisms
5. Gradual rollout with performance monitoring

### Success Metrics

#### Technical Metrics
- Fragment fetch success rate > 99.9%
- Average response time < 50ms
- Error rate < 0.1%
- Cache hit ratio > 95%

#### Business Metrics
- AI citation count increase
- LLM-driven traffic growth
- Visibility in AI overviews
- Organic traffic maintenance

---

## Conclusion

The ESI-based approach is recommended as the primary implementation strategy due to its lower complexity, proven reliability, and reduced operational overhead. The Edge Worker approach should be considered as a secondary option for customers requiring more dynamic content manipulation capabilities.

Both approaches prioritize:
- Zero-invasive implementation
- SEO compliance
- Performance optimization
- Operational efficiency
- Cost-effective deployment

The implementation will be customer-controlled, minimizing Adobe's operational burden while providing maximum flexibility for different deployment scenarios.

---

 
