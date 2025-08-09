const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit();

const TRACKING_FILE = 'commit_tracking.json';
const DAILY_FILE = 'daily_update.txt';
const BRANCH_NAME = 'auto/daily-update';

// Inisialisasi tracking file kalau belum ada
function initTracking() {
    if (!fs.existsSync(TRACKING_FILE)) {
        fs.writeFileSync(TRACKING_FILE, JSON.stringify({
            total_commits: 0,
            last_commit: null
        }, null, 2));
    }
}

// Update progress tracking
function updateTracking() {
    const tracking = JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf-8'));
    tracking.total_commits += 1;
    tracking.last_commit = new Date().toISOString();
    fs.writeFileSync(TRACKING_FILE, JSON.stringify(tracking, null, 2));
}

// Update daily update file
function updateDailyLog() {
    const logLine = `${new Date().toISOString()} - Daily update completed\n`;
    fs.appendFileSync(DAILY_FILE, logLine);
}

// Commit & push ke branch auto/daily-update
async function makeCommit() {
    await git.checkoutLocalBranch(BRANCH_NAME).catch(async () => {
        await git.checkout(BRANCH_NAME);
    });

    await git.add([TRACKING_FILE, DAILY_FILE]);
    await git.commit(`Daily update & progress tracking - ${new Date().toISOString()}`);
    await git.push('origin', BRANCH_NAME);
    console.log(`✅ Commit & push sukses ke branch ${BRANCH_NAME}`);
}

// Main flow
(async () => {
    initTracking();
    updateTracking();
    updateDailyLog();
    await makeCommit();
})();
