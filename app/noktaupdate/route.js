import { spawn } from "node:child_process";
import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SCRIPT = path.join(process.cwd(), "updateproject.sh");

const ACTIONS = {
  update: [],
  rebuild: ["--no-pull"],
  rollback: ["--rollback"],
};

function secret() {
  return String(process.env.NOKTA_UPDATE_SECRET || "").trim();
}

function providedKey(request, body) {
  const header = request.headers.get("x-nokta-key") || "";
  const bearer = request.headers.get("authorization") || "";
  const token = bearer.toLowerCase().startsWith("bearer ") ? bearer.slice(7) : header;
  return String(request.nextUrl.searchParams.get("key") || body.key || token || "").trim();
}

function keysMatch(provided, expected) {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function actionOf(request, body) {
  const value = String(request.nextUrl.searchParams.get("action") || body.action || "update").trim().toLowerCase();
  return ACTIONS[value] ? value : null;
}

async function readBody(request) {
  const type = request.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    return request.json().catch(() => ({}));
  }
  if (type.includes("form")) {
    const form = await request.formData().catch(() => null);
    if (!form) return {};
    return { key: form.get("key"), action: form.get("action") };
  }
  return {};
}

function startScript(args) {
  if (!existsSync(SCRIPT)) {
    return Promise.reject(new Error("updateproject.sh bulunamadı."));
  }

  // PM2 restart bu Node sürecini öldürür; isteği bekletmeden kopar.
  return new Promise((resolve, reject) => {
    const child = spawn("bash", [SCRIPT, ...args], {
      cwd: process.cwd(),
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.once("error", reject);
    child.once("spawn", () => {
      child.unref();
      resolve();
    });
  });
}

async function handle(request) {
  const expected = secret();
  if (!expected) {
    return NextResponse.json({ ok: false, message: "NOKTA_UPDATE_SECRET tanımlı değil." }, { status: 503 });
  }

  const body = request.method === "GET" ? {} : await readBody(request);
  if (!keysMatch(providedKey(request, body), expected)) {
    return NextResponse.json({ ok: false, message: "Yetkisiz." }, { status: 401 });
  }

  const action = actionOf(request, body);
  if (!action) {
    return NextResponse.json({ ok: false, message: "action update, rebuild veya rollback olmalı." }, { status: 400 });
  }

  try {
    await startScript(ACTIONS[action]);
  } catch (error) {
    return NextResponse.json({ ok: false, message: error.message || "Script başlatılamadı." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, action, message: "Güncelleme başlatıldı. Log: logs/update-*.log" },
    { status: 202 },
  );
}

export function GET(request) {
  return handle(request);
}

export function POST(request) {
  return handle(request);
}
