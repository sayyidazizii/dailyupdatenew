// Smart Commit Bot (Fixed Version)
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const git = simpleGit();

// Lock file untuk prevent concurrent runs
const LOCK_FILE = path.join(__dirname, '.bot-lock');
const MAX_LOCK_AGE = 5 * 60 * 1000; // 5 minutes

function acquireLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            const lockTime = fs.readFileSync(LOCK_FILE, 'utf8');
            const age = Date.now() - parseInt(lockTime);
            
            if (age < MAX_LOCK_AGE) {
                return false; // Lock masih aktif
            }
            // Lock expired, hapus
            fs.unlinkSync(LOCK_FILE);
        }
        
        fs.writeFileSync(LOCK_FILE, Date.now().toString());
        return true;
    } catch (error) {
        return false;
    }
}

function releaseLock() {
    try {
        if (fs.existsSync(LOCK_FILE)) {
            fs.unlinkSync(LOCK_FILE);
        }
    } catch (error) {
        // Ignore cleanup errors
    }
}

const commitMessages = [
    "📝 Daily activity update",
    "🔄 Regular maintenance commit",
    "✨ Fresh daily changes",
    "🚀 Automated sync update",
    "📊 Progress tracking update",
    "🔧 System maintenance log",
    "💫 Daily workflow commit",
    "⚡ Quick status update",
    "🌟 Regular check-in",
    "🎯 Daily milestone update",
    "🔥 Continuous improvement",
    "💡 Daily insights update",
    "🚧 Work in progress sync",
    "📈 Performance tracking",
    "🎨 Daily refinements",
    "🛠️ Routine optimization",
    "💪 Daily grind update",
    "🌈 Creative progress sync",
    "⭐ Excellence pursuit update",
    "🏆 Achievement tracking"
];

const activityTypes = [
    "code review session",
    "feature development",
    "bug fixing",
    "documentation update",
    "performance optimization",
    "testing improvements",
    "refactoring work",
    "security enhancements",
    "UI/UX improvements",
    "database optimization",
    "API development",
    "deployment preparation"
];

function getRandomCommitMessage() {
    return commitMessages[Math.floor(Math.random() * commitMessages.length)];
}

function getRandomActivity() {
    return activityTypes[Math.floor(Math.random() * activityTypes.length)];
}

function generateBranchName(activity) {
    return `auto/${activity.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
}

function shouldCommitNow() {
    const today = new Date().toDateString();
    const trackingFile = path.join(__dirname, 'commit_tracking.json');

    let tracking = {};
    if (fs.existsSync(trackingFile)) {
        try {
            tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
        } catch {
            tracking = {};
        }
    }

    if (tracking.date !== today) {
        tracking = {
            date: today,
            count: 0,
            targetCommits: Math.floor(Math.random() * 8) + 8
        };

        const filePath = path.join(__dirname, 'daily_update.txt');
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
        fs.appendFileSync(filePath, `\n🌅 === NEW DAY: ${timestamp} === Target: ${tracking.targetCommits} commits ===\n\n`);
        fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
    }

    return tracking.count < tracking.targetCommits && Math.random() > 0.3;
}

function incrementTrackingCount() {
    const trackingFile = path.join(__dirname, 'commit_tracking.json');

    let tracking = {};
    if (fs.existsSync(trackingFile)) {
        try {
            tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
        } catch {
            tracking = {};
        }
    }

    if (tracking.date === new Date().toDateString()) {
        tracking.count = (tracking.count || 0) + 1;
        fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
    }
}

async function stashIfDirty(message = '📦 Auto-save before switching branch') {
    const status = await git.status();
    if (!status.isClean()) {
        await git.add('.');
        await git.commit(message);
        await git.stash();
    }
}

async function ensureMainBranch() {
    const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
    if (currentBranch !== 'main') {
        await stashIfDirty();
        await git.checkout('main');
        await git.stash(['pop']).catch(() => {});
    }
}

module.exports = {
    acquireLock,
    releaseLock,
    getRandomCommitMessage,
    getRandomActivity,
    generateBranchName,
    shouldCommitNow,
    incrementTrackingCount,
    ensureMainBranch
};
