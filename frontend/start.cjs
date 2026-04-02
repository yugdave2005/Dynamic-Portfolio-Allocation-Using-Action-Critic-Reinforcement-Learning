delete process.env.ELECTRON_RUN_AS_NODE;
const { spawnSync } = require('child_process');
console.log('[App Startup] Clearing IDE Node environment variables... Launching Desktop Engine.');
spawnSync('npx', ['electron', '.'], { stdio: 'inherit', shell: true });
