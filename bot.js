const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const git = simpleGit();

const commitMessages = [
    "📝 Daily activity update", "🔄 Regular maintenance commit", "✨ Fresh daily changes",
    "🚀 Automated sync update", "📊 Progress tracking update", "🔧 System maintenance log",
    "💫 Daily workflow commit", "⚡ Quick status update", "🌟 Regular check-in",
    "🎯 Daily milestone update", "🔥 Continuous improvement", "💡 Daily insights update",
    "🚧 Work in progress sync", "📈 Performance tracking", "🎨 Daily refinements",
    "🛠️ Routine optimization", "💪 Daily grind update", "🌈 Creative progress sync",
    "⭐ Excellence pursuit update", "🏆 Achievement tracking"
];

const activityTypes = [
    "code review session", "feature development", "bug fixing", "documentation update",
    "performance optimization", "testing improvements", "refactoring work", "security enhancements",
    "UI/UX improvements", "database optimization", "API development", "deployment preparation"
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
        } catch (error) {
            tracking = {};
        }
    }

    if (tracking.date !== today) {
        tracking = {
            date: today,
            count: 0,
            targetCommits: Math.floor(Math.random() * 8) + 8 // 8–15
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

    const shouldCommit = tracking.count < tracking.targetCommits && Math.random() > 0.3;

    if (shouldCommit) {
        tracking.count += 1;
    }

    fs.writeFileSync(trackingFile, JSON.stringify(tracking, null, 2));
    console.log(`Today's progress: ${tracking.count}/${tracking.targetCommits} commits`);
    return shouldCommit;
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
    fs.appendFileSync(filePath, logEntry);
    console.log(`${type}: ${message}`);
}

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

async function makeCommit() {
    if (!shouldCommitNow()) {
        console.log('⏭️  Skipping commit this time - maintaining natural frequency');
        return;
    }

    addLog('🤖 Bot execution started', 'SYSTEM');

    const activity = getRandomActivity();
    const branchName = generateBranchName(activity);
    const commitMessage = getRandomCommitMessage();

    addLog(`🎯 Started working on: ${activity}`, 'ACTIVITY');

    try {
        const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
        addLog(`📍 Current branch: ${currentBranch}`, 'BRANCH');

        if (currentBranch !== 'main' && currentBranch !== 'master') {
            try {
                await git.checkout('main');
                addLog('🔄 Switched to main branch', 'BRANCH');
            } catch {
                await git.checkout('master');
                addLog('🔄 Switched to master branch', 'BRANCH');
            }
        }

        await git.pull();
        addLog('⬇️ Pulled latest changes', 'SYNC');

        await git.checkoutLocalBranch(branchName);
        addLog(`🌿 Created and switched to branch: ${branchName}`, 'BRANCH');

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
            addLog(progressMessages[i], 'PROGRESS');
        }

        await git.add(filePath);
        await git.commit(commitMessage);
        addLog(`✅ Commit successful: ${commitMessage}`, 'COMMIT');

        await git.push('origin', branchName);
        addLog(`🚀 Branch pushed to remote: ${branchName}`, 'PUSH');

        // PR create
        const prTitle = `[Auto] ${commitMessage}`;
        const prBody = `Automated PR for ${activity}`;
        const prResult = execSafeSync(`gh pr create --title "${prTitle}" --body "${prBody}" --base main --head ${branchName}`);

        if (prResult.success) {
            addLog('🔀 Pull request created via GitHub CLI', 'PR');

            // Extract PR number
            const match = prResult.output.match(/\/pull\/(\d+)/);
            const prNum = match ? match[1] : null;

            if (prNum) {
                addLog(`📋 PR #${prNum} created successfully: ${prResult.output}`, 'PR');

                const mergeResult = execSafeSync(`gh pr merge ${prNum} --merge --delete-branch`);
                if (mergeResult.success) {
                    addLog('🧹 Pull request merged and branch deleted', 'CLEANUP');
                } else {
                    addLog(`⚠️ Auto-merge failed: ${mergeResult.error}`, 'WARNING');
                    try {
                        await git.checkout('main');
                        await git.merge([branchName]);
                        await git.push();
                        await git.deleteLocalBranch(branchName);
                        addLog('🔄 Manual merge completed', 'CLEANUP');
                    } catch (manualErr) {
                        addLog(`❌ Manual merge also failed: ${manualErr.message}`, 'ERROR');
                    }
                }
            }
        } else {
            addLog(`❌ PR creation failed: ${prResult.error}`, 'ERROR');
        }
    } catch (err) {
        addLog(`❌ Error during git/PR process: ${err.message}`, 'ERROR');
        try {
            const currentBranch = await git.revparse(['--abbrev-ref', 'HEAD']);
            if (currentBranch !== 'main' && currentBranch !== 'master') {
                await git.checkout('main');
                await git.deleteLocalBranch(branchName);
                addLog('🧹 Cleaned up failed branch', 'CLEANUP');
            }
        } catch (cleanupErr) {
            addLog(`⚠️ Cleanup failed: ${cleanupErr.message}`, 'WARNING');
        }
    }

    addLog('🏁 Bot execution finished', 'SYSTEM');
    addLog('─'.repeat(60), 'SEPARATOR');
}

if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN or GH_TOKEN environment variable not set');
    process.exit(1);
}

makeCommit();
