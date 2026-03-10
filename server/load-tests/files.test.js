import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 30 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.1"],
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
  const token = login();
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const listRes = http.get(`${BASE_URL}/files`, authHeaders);
  check(listRes, {
    "list files status 200": (r) => r.status === 200,
  });

  sleep(1);

  const foldersRes = http.get(`${BASE_URL}/folders`, authHeaders);
  check(foldersRes, {
    "list folders status 200": (r) => r.status === 200,
  });

  sleep(1);
}
