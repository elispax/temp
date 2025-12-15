const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

// --- Configuration ---
const CONFIG = {
    indexTitle: 'elisapaci',
    template: './template.html',
    src: './pages',
    dest: './docs'
};

/**
 * Helper: Formats a filename into a title
 * e.g., "my-cool-page.html" -> "My Cool Page"
 */
function prettyTitle(filename) {
    const name = path.parse(filename).name;
    return name
        .replace("index", CONFIG.indexTitle)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Core rendering logic for HTML files
 */
function processHtml(srcPath, destPath, template) {
    const content = fs.readFileSync(srcPath, 'utf8');
    const title = prettyTitle(srcPath);
    
    // Render content into the template
    const output = mustache.render(template, {
        title: title,
        content: content
    });

    fs.writeFileSync(destPath, output);
    console.log(`📝 Rendered: ${path.basename(srcPath)}`);
}

/**
 * Core copying logic for non-HTML files (images, css, etc.)
 */
function copyAsset(srcPath, destPath) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`📦 Copied:   ${path.basename(srcPath)}`);
}

/**
 * Recursive function to traverse directories
 */
function traverseAndBuild(currentDir, outputDir, template) {
    // Ensure the output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const items = fs.readdirSync(currentDir);

    items.forEach(item => {
        const srcPath = path.join(currentDir, item);
        const destPath = path.join(outputDir, item);
        const stats = fs.statSync(srcPath);

        if (stats.isDirectory()) {
            // Recurse into subdirectories
            traverseAndBuild(srcPath, destPath, template);
        } else if (stats.isFile()) {
            // Check extension
            if (path.extname(item).toLowerCase() === '.html') {
                processHtml(srcPath, destPath, template);
            } else {
                copyAsset(srcPath, destPath);
            }
        }
    });
}

/**
 * Main Execution
 */
function build() {
    console.time('Build Time');
    console.log('🚀 Starting build...');

    try {
        // 1. Load the Mustache template
        const template = fs.readFileSync(CONFIG.template, 'utf8');

        // 2. Start traversal
        traverseAndBuild(CONFIG.src, CONFIG.dest, template);

        console.log('\n✅ Build complete!');
    } catch (err) {
        console.error('\n❌ Build failed:', err.message);
        process.exit(1);
    }
    console.timeEnd('Build Time');
}

build();
