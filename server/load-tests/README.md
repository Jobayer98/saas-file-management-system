# Load Testing

Load tests for the SaaS File Management System backend using k6.

## Prerequisites

Install k6: https://k6.io/docs/get-started/installation/

## Test Files

- `auth.test.js` - Authentication endpoint load test
- `files.test.js` - File operations load test
- `full.test.js` - Comprehensive test covering all major endpoints
- `spike.test.js` - Spike/stress test with sudden traffic increases

## Running Tests

### Before Load Testing

**Disable rate limiting:**

```bash
# Add to your .env file
DISABLE_RATE_LIMIT=true
```

Or use the provided config:

```bash
cp .env.loadtest .env.backup
cp .env .env.backup
cat .env.loadtest >> .env
```

### Basic Usage

```bash
k6 run load-tests/auth.test.js
```

### With Custom API URL

```bash
k6 run -e API_URL=http://localhost:5001/api load-tests/auth.test.js
```

### Run All Tests

```bash
npm run load-test
npm run load-test:auth
npm run load-test:files
npm run load-test:full
npm run load-test:spike
```

### Generate HTML Report

```bash
k6 run --out json=results.json load-tests/full.test.js
```

## Test Scenarios

### auth.test.js

- Ramps up to 20 users over 30s
- Maintains 50 users for 1 minute
- Ramps down to 0 over 30s
- Tests login endpoint

### files.test.js

- Ramps up to 10 users over 30s
- Maintains 30 users for 1 minute
- Tests file and folder listing █ TOTAL RESULTS

  checks_total.......................: 644 5.329128/s
  checks_succeeded...................: 96.27% 620 out of 644
  checks_failed......................: 3.72% 24 out of 644

  ✗ login status 200
  ↳ 96% — ✓ 310 / ✗ 12
  ✗ has token
  ↳ 96% — ✓ 310 / ✗ 12

### full.test.js

- Ramps up to 50 users over 1 minute
- Maintains 100 users for 3 minutes
- Tests authentication, files, folders, and dashboard

### spike.test.js

- Sudden spike from 0 to 100 users
- Spike from 100 to 200 users
- Tests system under stress

## Thresholds

- 95th percentile response time < 500-2000ms
- Error rate < 5-10%

## Metrics

k6 provides:

- `http_req_duration` - Request duration
- `http_req_failed` - Failed requests
- `http_reqs` - Total requests
- `vus` - Virtual users
- `iterations` - Completed iterations
