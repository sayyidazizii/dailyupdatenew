// Smart Commit Bot (Fixed Version)
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const git = simpleGit();

// safe wrapper used throughout
function execSafeSync(command, options = {}) {
    try {
        const result = execSync(command, {
            encoding: 'utf8',
            stdio: 'pipe',
            ...options
        });
        return { success: true, output: result.trim() };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            output: error.stdout ? error.stdout.trim() : ''
        };
    }
}

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

function addLog(message, type = 'INFO') {
    const filePath = path.join(__dirname, 'daily_update.txt');
    const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const logEntry = `[${timestamp} WIB] [${type}] ${message}\n`;
    try {
        fs.appendFileSync(filePath, logEntry);
    } catch (e) {
        console.warn('Failed to write to daily_update.txt:', e.message);
    }
    console.log(`${type}: ${message}`);
}

function shouldCommitNow() {
    const today = new Date().toDateString();
    const trackingFile = path.join(__dirname, 'commit_tracking.json');

    let tracking = {};
    if (fs.existsSync(trackingFile)) {
        try {
            tracking = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
        } catch (error) {
            console.warn('⚠️ Failed to parse existing tracking file, resetting.', error);
            tracking = {};
        }
    }

    if (tracking.date !== today) {
        tracking = {
            date: today,
            count: 0,
            targetCommits: Math.floor(Math.random() * 6) + 5 // 5–10
        };

        const filePath = path.join(__dirname, 'daily_update.txt');
        const timestamp = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
        fs.appendFileSync(filePath, `\n🌅 === NEW DAY: ${timestamp} === Target: ${tracking.targetCommits} commits ===\n\n`);
    }

    const shouldCommit = tracking.count < tracking.targetCommits;

    if (shouldCommit) {
        tracking.count += 1;
    }

    // Write and verify
    try {
        fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
    } catch (writeErr) {
        console.error('❌ Failed to write tracking file:', writeErr);
    }

    let onDisk = null;
    try {
        onDisk = JSON.parse(fs.readFileSync(trackingFile, 'utf8'));
    } catch (readErr) {
        console.error('❌ Failed to re-read tracking file after write:', readErr);
    }

    console.log('📍 trackingFile:', trackingFile);
    console.log('📝 tracking (in-memory):', tracking);
    console.log('🧐 tracking (on-disk):', onDisk);
    console.log(`Today's progress: ${tracking.count}/${tracking.targetCommits} commits`);

    return { shouldCommit, tracking };
}

async function syncWithRemote() {
    try {
        await git.fetch();
        await git.reset(['--hard', 'origin/main']);
        addLog('🔄 Synced with remote main branch', 'SYNC');
        return true;
    } catch (error) {
        addLog(`❌ Failed to sync with remote: ${error.message}`, 'ERROR');
        return false;
    }
}

async function safeStashPop() {
    try {
        if (process.env.GITHUB_ACTIONS) {
            return true;
        }

        const stashList = await git.stashList();
        if (stashList.total > 0) {
            await git.stash(['pop']);
            addLog('📦 Restored stashed changes', 'STASH');
        }
        return true;
    } catch (error) {
        addLog(`⚠️ Failed to restore stash: ${error.message}`, 'WARNING');
        return false;
    }
}

async function makeCommit() {
    if (process.env.GITHUB_ACTIONS) {
        console.log('🔄 Running in GitHub Actions - skipping lock check');
    } else if (!acquireLock()) {
        console.log('🔒 Another bot instance is running, skipping...');
        return;
    }

    try {
        const { shouldCommit, tracking } = shouldCommitNow();
        if (!shouldCommit) {
            console.log('⏭️  Skipping commit this time - maintaining natural frequency');
            return;
        }

        // Debug the tracking file after update
        const trackingPath = path.join(__dirname, 'commit_tracking.json');
        let diskAfter = {};
        try {
            diskAfter = JSON.parse(fs.readFileSync(trackingPath, 'utf8'));
            addLog(`DEBUG tracking on disk after shouldCommitNow: ${JSON.stringify(diskAfter)}`, 'DEBUG');
        } catch (e) {
            addLog(`❌ Failed to read tracking file for debug: ${e.message}`, 'ERROR');
        }

        addLog('🤖 Bot execution started', 'SYSTEM');

        const activity = getRandomActivity();
        const branchName = generateBranchName(activity);
        const randomMsg = getRandomCommitMessage();
        const trackingSummary = `Progress ${tracking.count}/${tracking.targetCommits}`;
        const commitMessage = `${randomMsg} | ${activity} | ${trackingSummary}`;

        addLog(`🎯 Started working on: ${activity}`, 'ACTIVITY');

        // Ensure base is up-to-date main
        const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
        if (currentBranch !== 'main') {
            await git.checkout('main');
            addLog('🔄 Switched to main branch', 'BRANCH');
        }
        if (!(await syncWithRemote())) return;

        // Create feature branch
        await git.checkoutLocalBranch(branchName);
        addLog(`🌿 Created and switched to branch: ${branchName}`, 'BRANCH');

        // Apply changes
        const filePath = path.join(__dirname, 'daily_update.txt');
        fs.appendFileSync(filePath, `Activity: ${activity}\n`);

        const progressMessages = [
            '🔍 Analyzing requirements',
            '⚡ Implementing solution',
            '🧪 Running tests',
            '✅ Task completed successfully'
        ];
        const numLogs = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numLogs; i++) {
            if (i < progressMessages.length) {
                addLog(progressMessages[i], 'PROGRESS');
            }
        }

        // SINGLE combined commit: tracking + daily update
        await git.add([filePath, 'commit_tracking.json']);
        await git.commit(commitMessage);
        addLog(`✅ Single combined commit: ${commitMessage}`, 'COMMIT');

        await git.push('origin', branchName);
        addLog(`🚀 Branch pushed: ${branchName}`, 'PUSH');

        // Create PR
        const prTitle = `[Auto] ${commitMessage}`;
        const prBody = `Automated PR for ${activity}\n\nThis PR contains a single combined commit updating tracking progress and activity log. It will be merged automatically.`;
        const prResult = execSafeSync(`gh pr create --title "${prTitle}" --body "${prBody}" --base main --head ${branchName}`);

        if (!prResult.success) {
            addLog(`❌ PR creation failed: ${prResult.error}`, 'ERROR');
            await cleanupBranch(branchName);
            return;
        }

        addLog('🔀 Pull request created via GitHub CLI', 'PR');
        const prNumberMatch = prResult.output.match(/(\d+)$/);
        if (!prNumberMatch) {
            addLog('⚠️ Could not parse PR number from output, aborting auto-merge', 'WARNING');
            return;
        }
        const prNum = prNumberMatch[1];
        addLog(`📋 PR #${prNum} created successfully`, 'PR');

        // Auto-merge with squash and delete branch (immediate)
        const mergeResult = execSafeSync(`gh pr merge ${prNum} --squash --delete-branch`);
        if (mergeResult.success) {
            // Sinkronisasi main lokal paksa agar sesuai remote
            await git.fetch();
            try {
                await git.checkout('main');
            } catch {
                await git.checkout(['-f', 'main']);
            }
            await git.reset(['--hard', 'origin/main']);
            addLog('🧹 PR squash-merged and local main force-synced', 'CLEANUP');
        } else {
            addLog(`⚠️ Auto-merge failed: ${mergeResult.error}`, 'WARNING');
        }

    } catch (err) {
        addLog(`❌ Error during git/PR process: ${err.message}`, 'ERROR');
    } finally {
        if (!process.env.GITHUB_ACTIONS) releaseLock();
        addLog('🏁 Bot execution finished', 'SYSTEM');
        addLog('─'.repeat(60), 'SEPARATOR');
    }
}

async function attemptManualMerge(branchName) {
    try {
        const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
        addLog(`📍 Currently on branch: ${currentBranch}`, 'BRANCH');

        if (currentBranch !== 'main') {
            const status = await git.status();
            if (!status.isClean()) {
                addLog('⚠️ Pending changes detected before manual merge; please resolve or stash manually', 'WARNING');
            }
            await git.checkout('main');
            addLog('🔄 Switched to main branch', 'BRANCH');
        }

        await syncWithRemote();

        await git.merge([branchName]);
        addLog('🔄 Manual merge completed', 'CLEANUP');

        // Push to main (we're already on main)
        let pushSuccess = false;
        for (let i = 0; i < 3; i++) {
            try {
                await git.push('origin', 'main');
                pushSuccess = true;
                addLog('✅ Changes pushed successfully', 'PUSH');
                break;
            } catch (pushError) {
                addLog(`⚠️ Push attempt ${i + 1} failed: ${pushError.message}`, 'WARNING');
                if (i < 2) {
                    await syncWithRemote();
                    await git.merge([branchName]);
                }
            }
        }

        if (!pushSuccess) {
            addLog('❌ All push attempts failed', 'ERROR');
        }

        // Clean up local branch
        await cleanupBranch(branchName);
    } catch (manualMergeErr) {
        addLog(`❌ Manual merge failed: ${manualMergeErr.message}`, 'ERROR');
        await cleanupBranch(branchName);
    }
}

async function cleanupBranch(branchName) {
    try {
        const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
        if (currentBranch !== 'main') {
            await git.checkout('main');
            addLog('🔄 Switched to main branch', 'BRANCH');
        }

        try {
            await git.deleteLocalBranch(branchName);
            addLog(`🧹 Cleaned up local branch: ${branchName}`, 'CLEANUP');
        } catch {
            // ignore if branch doesn't exist
        }

        await safeStashPop();
    } catch (cleanupErr) {
        addLog(`⚠️ Cleanup failed: ${cleanupErr.message}`, 'WARNING');
    }
}

if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN or GH_TOKEN environment variable not set');
    process.exit(1);
}

makeCommit();
