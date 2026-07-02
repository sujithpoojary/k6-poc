import http from 'k6/http';
import { check, group, sleep } from 'k6';

// Lightweight smoke test designed for CI/CD on k6 Cloud free tier.
// Fast (< 1 min), low VUs, single region — runs on every push.
export const options = {
  cloud: {
    projectID: 7975862,
    name: 'CI Smoke Test',
    note: `Branch: ${__ENV.BRANCH || 'unknown'} | Run: ${__ENV.GITHUB_RUN_NUMBER || 'local'}`,
  },
  stages: [
    { duration: '15s', target: 3 },  // ramp up to 3 VUs
    { duration: '30s', target: 3 },  // hold
    { duration: '15s', target: 0  }, // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // p95 under 1s
    http_req_failed:   ['rate<0.05'],   // less than 5% errors
    checks:            ['rate>0.95'],   // 95%+ checks passing
  },
};

const BASE = __ENV.BASE_URL || 'https://postman-echo.com';

export default function () {

  group('Health Check', () => {
    const res = http.get(`${BASE}/get`);
    check(res, {
      'status is 200':        (r) => r.status === 200,
      'response time < 1s':   (r) => r.timings.duration < 1000,
      'has valid body':       (r) => r.body.length > 0,
    });
  });

  sleep(0.5);

  group('API Endpoint', () => {
    const res = http.post(
      `${BASE}/post`,
      JSON.stringify({ test: 'ci-check', run: __ENV.GITHUB_RUN_NUMBER }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    check(res, {
      'post status is 200':   (r) => r.status === 200,
      'response has data':    (r) => r.json().data !== undefined,
    });
  });

  sleep(1);
}
