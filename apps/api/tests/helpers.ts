export class SmokeTestRunner {
  private steps: Array<{
    name: string;
    fn: () => Promise<void>;
  }> = [];
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private start = Date.now();

  step(name: string, fn: () => Promise<void>) {
    this.steps.push({ name, fn });
  }

  async run() {
    const verbose = process.argv.includes('--verbose');
    console.log('\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
    console.log('  HMS API Smoke Test Suite');
    console.log(`  Target: ${process.env.API_URL ?? 'http://localhost:3001'}`);
    console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n');

    for (const { name, fn } of this.steps) {
      try {
        if (verbose) process.stdout.write(`  \u25b6 ${name}... `);
        await fn();
        this.passed++;
        console.log(`  \u2705 ${name}`);
      } catch (err: any) {
        this.failed++;
        console.log(`  \u274c ${name}`);
        console.log(`     \u2192 ${err.message}`);
        if (verbose && err.response) {
          console.log(`     Status: ${err.response.status}`);
          console.log(`     Body: ${JSON.stringify(err.response.body, null, 2)}`);
        }
      }
    }

    const duration = ((Date.now() - this.start) / 1000).toFixed(2);

    console.log('\n\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501');
    console.log(`  Results: ${this.passed} passed, ${this.failed} failed`);
    console.log(`  Duration: ${duration}s`);
    console.log('\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n');

    if (this.failed > 0) {
      console.error(`  \u26a0  ${this.failed} test(s) failed`);
      process.exit(1);
    } else {
      console.log('  \ud83c\udf89 All tests passed! System is operational.');
      process.exit(0);
    }
  }
}

export function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined`);
      }
    },
    toBeGreaterThan(n: number) {
      if (!(actual > n)) {
        throw new Error(`Expected ${actual} to be greater than ${n}`);
      }
    },
    toContain(item: any) {
      if (!actual.includes(item)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
      }
    },
  };
}

export let accessToken = '';
export function setToken(t: string) { accessToken = t; }

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function get(url: string, authenticated = false) {
  const headers = authenticated ? authHeaders() : { 'Content-Type': 'application/json' };
  const res = await fetch(url, { headers });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, ...body, _raw: body };
}

export async function authGet(url: string) {
  return get(url, true);
}

export async function post(url: string, body: any, authenticated = false) {
  const headers = authenticated ? authHeaders() : { 'Content-Type': 'application/json' };
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json, _raw: json };
}

export async function authPost(url: string, body: any) {
  return post(url, body, true);
}

export async function authPatch(url: string, body: any) {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

export async function authDelete(url: string) {
  const res = await fetch(url, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

export function log(msg: string) {
  if (process.argv.includes('--verbose')) {
    console.log(msg);
  }
}
