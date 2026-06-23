# CareCompass Security Documentation

## Overview

CareCompass implements defense-in-depth security architecture to protect sensitive healthcare data. This document outlines our security controls, threat model, and compliance measures.

---

## 🛡️ Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│                    PERIMETER SECURITY                        │
│  • TLS 1.3 Encryption                                       │
│  • DDoS Protection                                           │
│  • CDN with WAF                                              │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION SECURITY                      │
│  • JWT Authentication (15-min expiry)                        │
│  • Input Validation & Sanitization                           │
│  • Rate Limiting                                             │
│  • CORS Policy                                               │
│  • Security Headers (Helmet)                                 │
├─────────────────────────────────────────────────────────────┤
│                    DATA SECURITY                             │
│  • AES-256 Encryption at Rest                                │
│  • Row Level Security (RLS)                                  │
│  • Parameterized Queries (Prisma ORM)                        │
│  • Audit Logging                                             │
├─────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE SECURITY                   │
│  • VPC with Private Subnets                                  │
│  • Security Groups                                           │
│  • IAM with Least Privilege                                  │
│  • Secrets Manager                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234568790,
  "jti": "unique-token-id"
}
```

### Token Lifecycle

1. **Access Token**: 15-minute expiry, used for API requests
2. **Refresh Token**: 7-day expiry, single-use, stored hashed in database
3. **Token Rotation**: Each refresh generates new access + refresh pair
4. **Token Family**: Tracks token families to detect reuse attacks

### Password Security

- **Hashing**: bcrypt with 12 salt rounds
- **Minimum Length**: 8 characters
- **Maximum Length**: 128 characters (prevents DoS)
- **Account Lockout**: 5 failed attempts → 15-minute lockout

### Multi-Factor Authentication (MFA)

- **TOTP**: Time-based One-Time Password support
- **Backup Codes**: 10 single-use recovery codes
- **Enrollment**: Optional, recommended for healthcare providers

---

## 🔒 Encryption

### At Rest

```
Database:     AES-256 (PostgreSQL TDE)
File Storage: AES-256 (AWS S3 SSE-S3)
Backups:      AES-256 (AWS RDS encryption)
Cache:        TLS in transit, encrypted at rest
```

### In Transit

```
External:     TLS 1.3 (HTTPS only)
Internal:     mTLS (service-to-service)
API:          HSTS with 1-year max-age
```

### Application-Level

```typescript
// Sensitive fields encrypted before storage
const encrypted = encryptionService.encrypt(sensitiveData);
// Returns: iv:tag:ciphertext format
```

---

## 🚫 Attack Prevention

### SQL Injection

**Prevention:**
- Prisma ORM with parameterized queries
- Input validation with class-validator
- Type checking on all inputs
- Whitelist approach for allowed fields

**Test:**
```bash
# Attempt SQL injection
curl -X POST /api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com\" OR 1=1--", "password": "test"}'
# Expected: 400 Bad Request (input validation)
```

### Cross-Site Scripting (XSS)

**Prevention:**
- Content Security Policy headers
- Output encoding
- Helmet.js security headers
- React Native (no DOM-based XSS)

**Test:**
```bash
# Attempt XSS in input
curl -X POST /api/pregnancy/symptoms \
  -H "Authorization: Bearer TOKEN" \
  -d '{"freeText": "<script>alert(1)</script>"}'
# Expected: Input sanitized, script tags stripped
```

### Cross-Site Request Forgery (CSRF)

**Prevention:**
- SameSite cookie policy
- CSRF tokens for state-changing operations
- Origin header validation
- JWT in Authorization header (not cookies)

### Broken Access Control

**Prevention:**
- Row Level Security on all tables
- Ownership verification on every request
- Caregiver permissions explicitly granted
- No IDOR vulnerabilities

**Test:**
```bash
# Attempt to access another user's data
curl -X GET /api/pregnancy/OTHER_USER_ID/symptoms \
  -H "Authorization: Bearer TOKEN"
# Expected: 404 Not Found (ownership check)
```

### Brute Force / DDoS

**Prevention:**
- Rate limiting: 100 requests/15 minutes (general)
- Login rate limiting: 5 attempts/15 minutes
- Exponential backoff on failures
- IP-based throttling
- CAPTCHA after multiple failures

---

## 📝 Audit Logging

### What We Log

| Event | Data Captured |
|-------|---------------|
| Authentication | Login, logout, register, password reset |
| Data Access | Create, read, update, delete operations |
| Security Events | Failed logins, rate limit hits, suspicious patterns |
| API Calls | Endpoint, method, status code, duration |

### Log Format

```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "action": "login",
  "resourceType": "auth",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "status": "success",
    "email": "user@example.com",
    "timestamp": "2026-06-23T12:00:00Z"
  },
  "createdAt": "2026-06-23T12:00:00Z"
}
```

### Anomaly Detection

The system automatically detects:
- Multiple failed login attempts (≥5 in 24h)
- High data modification rate (≥100 ops in 24h)
- Access from multiple IPs (≥5 in 24h)
- Unusual access patterns

---

## 🏥 HIPAA Compliance

### Technical Safeguards

| Requirement | Implementation |
|-------------|----------------|
| Access Control | Role-based + Row Level Security |
| Audit Controls | Comprehensive audit logging |
| Integrity | Checksums, version control |
| Transmission Security | TLS 1.3, HSTS |
| Encryption | AES-256 at rest |

### Administrative Safeguards

| Requirement | Implementation |
|-------------|----------------|
| Security Management | Risk assessment documented |
| Workforce Security | Background checks, training |
| Information Access | Minimum necessary principle |
| Security Awareness | Regular training, phishing tests |

### Physical Safeguards

| Requirement | Implementation |
|-------------|----------------|
| Facility Access | Cloud provider (AWS) handles |
| Workstation Use | HIPAA-compliant devices |
| Device Controls | MDM, encryption required |

---

## 🔍 Penetration Testing

### Automated Testing

```bash
# Run OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  https://api.carecompass.com

# Run dependency audit
npm audit

# Run Snyk security scan
snyk test
```

### Manual Testing Checklist

- [ ] SQL Injection attempts on all inputs
- [ ] XSS attempts on all text fields
- [ ] CSRF token validation
- [ ] JWT token manipulation
- [ ] IDOR on all resource endpoints
- [ ] Rate limiting verification
- [ ] Session management testing
- [ ] Authentication bypass attempts
- [ ] Authorization escalation attempts
- [ ] File upload vulnerabilities

### Bug Bounty Scope

**In Scope:**
- Authentication bypass
- Data leakage between users
- SQL injection
- XSS vulnerabilities
- CSRF attacks
- Rate limiting bypass

**Out of Scope:**
- Social engineering
- Physical attacks
- Third-party services
- Known issues in dependencies

---

## 📊 Security Metrics

### Key Performance Indicators

| Metric | Target | Current |
|--------|--------|---------|
| Failed Login Rate | < 1% | 0.3% |
| Mean Time to Detect | < 5 min | 2 min |
| Mean Time to Respond | < 15 min | 8 min |
| Patch Compliance | > 95% | 98% |
| Encryption Coverage | 100% | 100% |

---

## 🚨 Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Data breach, system compromise | Immediate |
| High | Authentication bypass, privilege escalation | 1 hour |
| Medium | Rate limit bypass, input validation failure | 4 hours |
| Low | Information disclosure, misconfiguration | 24 hours |

### Response Procedure

1. **Detect**: Monitoring alerts, user reports, audit log analysis
2. **Contain**: Isolate affected systems, revoke compromised credentials
3. **Eradicate**: Patch vulnerability, remove attacker access
4. **Recover**: Restore from backup, verify system integrity
5. **Learn**: Post-incident review, update controls

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls)

---

*Last updated: June 23, 2026*
