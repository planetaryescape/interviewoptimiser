# Security Audit Report - Interview Optimiser

Date: 2025-07-10

## Executive Summary

The Interview Optimiser codebase shows good security practices in many areas, particularly in authentication and authorization. However, several vulnerabilities and areas for improvement have been identified.

## Vulnerabilities Found

### 1. **CRITICAL - Missing Authorization Check** (High Severity)

**File**: `/src/app/api/jobs/[jobId]/reports/route.ts`
**Lines**: 35-50
**Issue**: The API endpoint retrieves job reports based on jobId without verifying that the requesting user owns the job. Any authenticated user can access any job's reports by knowing or guessing the jobId.
**Impact**: Unauthorized access to sensitive interview reports and data belonging to other users.
**Recommended Fix**: Add authorization check to verify the job belongs to the authenticated user before returning reports.

### 2. **HIGH - Hardcoded Secret in Source Code** (High Severity)

**File**: `/src/lib/utils/idHandler.ts`
**Line**: 23
**Issue**: The salt for ID encoding is hardcoded: `"qT6uuo!8J@ZuhwE6qzU@P.h34jZ-*J@"`
**Impact**: If the source code is exposed, attackers can decode all encoded IDs, potentially enabling enumeration attacks.
**Recommended Fix**: Move the salt to environment variables and rotate it.

### 3. **HIGH - No Rate Limiting** (High Severity)

**Files**: All API routes
**Issue**: No rate limiting middleware or implementation found across any API endpoints.
**Impact**: APIs are vulnerable to:

- Brute force attacks
- DoS attacks
- Resource exhaustion
- Excessive API usage
  **Recommended Fix**: Implement rate limiting middleware using packages like `express-rate-limit` or a service like Cloudflare Rate Limiting.

### 4. **MEDIUM - Missing CSRF Protection** (Medium Severity)

**Files**: All API routes
**Issue**: No CSRF token validation found in state-changing operations.
**Impact**: Potential for cross-site request forgery attacks on authenticated endpoints.
**Recommended Fix**: Implement CSRF token validation for all state-changing operations (POST, PUT, DELETE).

### 5. **MEDIUM - Webhook Verification Weakness** (Medium Severity)

**File**: `/src/app/api/webhooks/auth/route.ts`
**Lines**: 21-301
**Issue**: The Clerk webhook endpoint doesn't verify the webhook signature or implement any authentication.
**Impact**: Attackers could send fake webhook events to create/modify/delete users.
**Recommended Fix**: Implement webhook signature verification using Clerk's webhook signing secret.

### 6. **MEDIUM - Potential XSS in PDF Generation** (Medium Severity)

**File**: `/src/app/api/generate-pdf/route.ts`
**Line**: 29
**Issue**: `htmlContent` from user input is passed directly to PDF generation without sanitization.
**Impact**: Potential for XSS attacks if the PDF is rendered in a web context.
**Recommended Fix**: Sanitize HTML content before PDF generation using a library like DOMPurify.

### 7. **LOW - Information Disclosure in Error Messages** (Low Severity)

**Files**: Multiple API routes
**Issue**: Some error responses include detailed error information that could aid attackers.
**Impact**: Information leakage about system internals.
**Recommended Fix**: Ensure production error messages are generic and don't expose system details.

### 8. **LOW - Missing Security Headers** (Low Severity)

**Files**: API responses
**Issue**: No security headers like `X-Content-Type-Options`, `X-Frame-Options`, etc.
**Impact**: Reduced defense against various client-side attacks.
**Recommended Fix**: Add security headers to all API responses.

## Positive Security Findings

1. **Strong Authentication**: Uses Clerk for authentication with proper middleware protection.
2. **SQL Injection Protection**: Uses Drizzle ORM with parameterized queries, preventing SQL injection.
3. **Input Sanitization**: Good sanitization of user text input in `sanitiseUserInputText.ts`.
4. **Stripe Webhook Verification**: Properly verifies Stripe webhook signatures.
5. **Environment Variables**: Sensitive configuration properly stored in environment variables (except for the ID salt).
6. **Authorization Checks**: Most endpoints properly verify user ownership (with noted exceptions).

## Recommendations

### Immediate Actions (Critical/High Priority)

1. Fix the authorization bypass in the jobs reports endpoint
2. Move the ID handler salt to environment variables
3. Implement rate limiting on all API endpoints
4. Add webhook signature verification for Clerk webhooks

### Short-term Actions (Medium Priority)

1. Implement CSRF protection
2. Add HTML sanitization for PDF generation
3. Review and standardize error handling to prevent information disclosure
4. Add security headers to API responses

### Long-term Actions (Low Priority)

1. Implement API versioning
2. Add request/response validation schemas for all endpoints
3. Implement API usage monitoring and alerting
4. Consider implementing API key authentication for certain endpoints
5. Add security testing to CI/CD pipeline

## Conclusion

The Interview Optimiser application has a solid security foundation with proper authentication and database query protection. However, the identified vulnerabilities, particularly the authorization bypass and lack of rate limiting, pose significant risks that should be addressed promptly. Implementing the recommended fixes will significantly improve the application's security posture.
