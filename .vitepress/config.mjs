import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { defineConfig } from 'vitepress'

// Paths
const docsDir = resolve(__dirname, '..', 'docs');

// Marker used in generated proxy files so we can detect and skip them when auto-generating the sidebar
const PROXY_MARKER = '<!-- generated-proxy -->';

// Helper: recursively list files in a directory (non-hidden entries)
function listMarkdownFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      files = files.concat(listMarkdownFiles(full));
    } else if (e.isFile() && e.name.endsWith('.md')) {
      files.push(full);
    }
  }
  return files;
}

// Generate lightweight proxy .md files for any *.hidden.md so they are accessible at the normal path.
// The proxy imports the hidden md as a Vue component and renders it, preserving the normal URL.
function generateHiddenProxies() {
  const allMd = listMarkdownFiles(docsDir);
  for (const path of allMd) {
    if (path.endsWith('.hidden.md')) {
      const target = path.replace(/\.hidden\.md$/, '.md');
      // Do not overwrite existing non-proxy files
      if (existsSync(target)) {
        try {
          const content = readFileSync(target, 'utf8');
          if (content.includes(PROXY_MARKER)) continue;
          continue;
        } catch (e) {
          continue;
        }
      }

      // Ensure directory exists (should already)
      const td = dirname(target);
      if (!existsSync(td)) mkdirSync(td, { recursive: true });

      // Compute relative import path from target to hidden file
      const importPath = './' + path.slice(td.length + 1).replace(/\\/g, '/');
      // Build proxy content
      const proxyContent = `${PROXY_MARKER}\n<script setup>\nimport Content from '${importPath}'\n</script>\n\n<Content/>\n`;
      writeFileSync(target, proxyContent, 'utf8');
    }
  }
}

// Run generator synchronously so proxies exist before VitePress reads files
try {
  generateHiddenProxies();
} catch (e) {
  // Fail silently — generation is best-effort
  console.error('generateHiddenProxies error:', e);
}

// Build the sidebar auto-dynamically by top-level folders in `docs`
function buildSidebar() {
  const entries = readdirSync(docsDir, { withFileTypes: true });
  const sidebar = [];

  // Include top-level pages (root .md files other than index.md)
  const rootFiles = entries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => join(docsDir, e.name));

  const rootItems = rootFiles
    .map(full => {
      // Exclude .hidden.md and generated proxies
      if (full.endsWith('.hidden.md')) return null;
      try {
        const content = readFileSync(full, 'utf8');
        if (content.includes(PROXY_MARKER)) return null;
      } catch (e) {}
      const name = basenameWithoutExt(full);
      // Skip index.md (home) unless it's desired
      if (name === 'index') return null;
      return { text: name, link: `/${name}` };
    })
    .filter(Boolean);

  if (rootItems.length) {
    sidebar.push({ text: 'root', items: rootItems });
  }

  // For each top-level folder, collect its markdown files (non-hidden, non-proxy)
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const folderPath = join(docsDir, e.name);
    const files = readdirSync(folderPath, { withFileTypes: true })
      .filter(f => f.isFile() && f.name.endsWith('.md'))
      .map(f => join(folderPath, f.name))
      .filter(full => {
        if (full.endsWith('.hidden.md')) return false;
        try {
          const content = readFileSync(full, 'utf8');
          if (content.includes(PROXY_MARKER)) return false;
        } catch (err) {}
        return true;
      });

    if (!files.length) continue;
    const items = files.map(full => {
      const name = basenameWithoutExt(full);
      // link should be /folder/name (strip any index specialness)
      const linkName = name === 'index' ? `/${e.name}/` : `/${e.name}/${name}`;
      return { text: name, link: linkName };
    });

    sidebar.push({ text: e.name, items });
  }

  // Prepend a home link
  sidebar.unshift({ text: 'home', link: '/azimuth' });
  return sidebar;
}

function basenameWithoutExt(fullPath) {
  const base = fullPath.split(/\\|\//).pop();
  return base.replace(/\.hidden\.md$|\.md$/i, '');
}

const sidebar = buildSidebar();

export default defineConfig({
  title: "Azimuth Docs",
  description: "Documentation of the Azimuth library",
  themeConfig: {
    nav: [
      { text: 'home', link: '/azimuth' },
    ],

    sidebar: sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  },
  srcDir: 'docs',
  base: "/AzimuthDocs/",
})
