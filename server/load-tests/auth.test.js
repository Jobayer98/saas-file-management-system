import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.1"],
  },
};

const BASE_URL = __ENV.API_URL || "http://localhost:5000/api";

export default function () {
  const loginPayload = JSON.stringify({
    email: "john@example.com",
    password: "password123",
  });

  const params = {
    headers: { "Content-Type": "application/json" },
  };

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, params);
  check(loginRes, {
    "login status 200": (r) => r.status === 200,
    "has token": (r) => r.json("data.token") !== undefined,
  });

  sleep(1);
}
