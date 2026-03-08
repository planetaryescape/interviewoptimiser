# Security Overview

Quick reference for security implementations in Interview Optimiser.

## 🔐 Implemented Security Features

### [CSRF Protection](./csrf-protection.md)
- **Status**: ✅ Implemented
- **Pattern**: Double-submit cookie with signed tokens
- **Quick Use**: Replace `fetch()` with `secureFetch()`

### [Webhook Security](./webhook-security.md)
- **Status**: ✅ Implemented
- **Pattern**: HMAC signature verification
- **Providers**: Clerk, Stripe, custom webhooks

### [Rate Limiting](./rate-limiting.md)
- **Status**: ✅ Implemented
- **Backend**: Upstash Redis
- **Limits**: 60 req/min (API), 10 req/10min (uploads)

## 🛡️ Security Checklist

### Authentication & Authorization
- ✅ Clerk authentication integrated
- ✅ User session management
- ✅ Role-based access control (via organizations)
- ✅ Secure token storage

### API Security
- ✅ CSRF protection on state-changing requests
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Zod schemas
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ XSS protection (React automatic escaping)

### Data Protection
- ✅ HTTPS enforced in production
- ✅ Secure cookies with httpOnly, secure, sameSite
- ✅ Environment variables via Doppler
- ✅ S3 presigned URLs for file access
- ✅ Database connection pooling

### Monitoring & Logging
- ✅ Sentry error tracking
- ✅ Structured logging with Pino
- ⚠️ Security event logging (partial)
- ⚠️ Audit trail (planned)

## 🚨 Security Response

### Reporting Security Issues
1. **DO NOT** create public GitHub issues
2. Email security concerns to: [security@interviewoptimiser.com]
3. Include: Description, steps to reproduce, impact assessment

### Common Security Tasks

#### Rotate CSRF Secret
```bash
# Generate new secret
openssl rand -base64 32

# Update in Doppler
doppler secrets set CSRF_SECRET=<new-secret>

# Restart application
```

#### Update Rate Limits
Edit `src/lib/rate-limit.ts`:
```typescript
export const rateLimits = {
  api: { requests: 60, window: 60 },
  upload: { requests: 10, window: 600 },
  // Add custom limits here
};
```

#### Verify Webhook Signatures
All webhooks automatically verify signatures. To add a new provider:
1. Add verification logic to `src/lib/webhook-security.ts`
2. Configure secret in Doppler
3. Test with webhook testing tool

## 📋 Security Audit Log

### Latest Audit: July 2025
- **Report**: [security-audit-report.md](../archive/security-audit-report-2025-07.md)
- **Critical Issues**: 0
- **High Issues**: 2 (fixed)
- **Medium Issues**: 5 (3 fixed, 2 in progress)
- **Low Issues**: 8 (monitoring)

### Recent Security Updates
- **2025-09**: Migrated from Vercel KV to Upstash Redis for rate limiting
- **2025-08**: Implemented CSRF protection across all endpoints
- **2025-07**: Added webhook signature verification
- **2025-06**: Initial security audit completed

## 🔗 Quick Links

- [OWASP Top 10 Checklist](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Clerk Security Documentation](https://clerk.com/docs/security)
- [AWS S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html)

---

For detailed implementation guides, see the individual security documentation files linked above.