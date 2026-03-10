import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "30s", target: 100 },
    { duration: "10s", target: 200 },
    { duration: "30s", target: 200 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.2"],
  },
};

const BASE_URL = __ENV.API_URL || "http://localhost:5001/api";

export default function () {
  const loginPayload = JSON.stringify({
    email: "john@example.com",
    password: "password123",
  });

  const res = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { "Content-Type": "application/json" },
  });

  check(res, {
    "status 200": (r) => r.status === 200,
  });

  sleep(0.5);
}
