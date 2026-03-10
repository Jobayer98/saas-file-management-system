import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m", target: 100 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<3000"],
    http_req_failed: ["rate<0.05"],
    errors: ["rate<0.1"],
  },
};

const BASE_URL = __ENV.API_URL || "http://localhost:5000/api";

function login() {
  const payload = JSON.stringify({
    email: "john@example.com",
    password: "password123",
  });

  const res = http.post(`${BASE_URL}/auth/login`, payload, {
    headers: { "Content-Type": "application/json" },
  });

  return res.json("data.token");
}

export default function () {
  let token;

  group("Authentication", () => {
    token = login();
    check(token, {
      "token received": (t) => t !== undefined && t !== null,
    }) || errorRate.add(1);
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  sleep(1);

  group("File Operations", () => {
    const listRes = http.get(`${BASE_URL}/files`, authHeaders);
    check(listRes, {
      "list files success": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);

  group("Folder Operations", () => {
    const foldersRes = http.get(`${BASE_URL}/folders`, authHeaders);
    check(foldersRes, {
      "list folders success": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(1);

  group("Dashboard", () => {
    const dashRes = http.get(`${BASE_URL}/dashboard/stats`, authHeaders);
    check(dashRes, {
      "dashboard stats success": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(2);
}
