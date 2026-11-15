import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const migrationsDir = join(root, 'supabase/migrations');
const failures = [];
const migrations = readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
const createdTables = new Map();

for (const name of migrations) {
  const sql = readFileSync(join(migrationsDir, name), 'utf8');
  for (const match of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z_][a-z0-9_]*)/gi)) {
    createdTables.set(match[1], name);
  }
}

for (const [table, migration] of createdTables) {
  const source = migrations.map((name) => readFileSync(join(migrationsDir, name), 'utf8')).join('\n');
  const pattern = new RegExp(`alter\\s+table\\s+(?:if\\s+exists\\s+)?public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, 'i');
  if (!pattern.test(source)) failures.push(`${table} (created in ${migration}) has no explicit RLS enable statement`);
}

const publicCodeDirs = ['app', 'components', 'lib'];
for (const directory of publicCodeDirs) {
  const stack = [join(root, directory)];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
        const source = readFileSync(path, 'utf8');
        if (/NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE|NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY/.test(source)) {
          failures.push(`${path.slice(root.length + 1)} exposes a service-role environment name`);
        }
      }
    }
  }
}

const requiredFiles = [
  '.github/workflows/ci.yml',
  '.github/dependabot.yml',
  'docs/release/RELEASE_GATES.md',
  'docs/release/INCIDENT_RESPONSE.md',
  'docs/release/BACKUP_AND_RESTORE.md',
  'docs/release/ACCESSIBILITY_QA.md',
  'supabase/tests/rls_inventory.sql',
];
for (const file of requiredFiles) if (!existsSync(join(root, file))) failures.push(`missing ${file}`);

const nextConfig = readFileSync(join(root, 'next.config.ts'), 'utf8');
for (const header of ['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'Permissions-Policy']) {
  if (!nextConfig.includes(header)) failures.push(`missing security header ${header}`);
}

console.log(`MINGLE release static audit: ${createdTables.size} SQL tables inspected across ${migrations.length} migrations.`);
if (failures.length) {
  console.error(`FAILED (${failures.length})`);
  for (const failure of failures) console.error(` - ${failure}`);
  process.exitCode = 1;
} else {
  console.log('PASS: RLS declarations, service-role naming scan, security headers and release artifacts.');
}
