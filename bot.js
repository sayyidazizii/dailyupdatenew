const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const git = simpleGit();

// Array commit messages yang beragam
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

// Array variasi content untuk file log
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

function shouldCommitNow() {
    // Baca file tracking untuk cek berapa kali sudah commit hari ini
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
    
    // Reset counter jika hari berbeda
    if (tracking.date !== today) {
        tracking = {
            date: today,
            count: 0,
            targetCommits: Math.floor(Math.random() * 7) + 8 // Random 8-14
        };
        
        // Log new day
        const filePath = path.join(__dirname, 'daily_update.txt');
        const timestamp = new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'short', 
            day: '2-digit'
        });
        fs.appendFileSync(filePath, `\n🌅 === NEW DAY: ${timestamp} === Target: ${tracking.targetCommits} commits ===\n\n`);
    }
    
    // Commit jika belum mencapai target dan dengan probabilitas
    const shouldCommit = tracking.count < tracking.targetCommits && Math.random() > 0.3;
    
    if (shouldCommit) {
        tracking.count += 1;
    }
    
    // Simpan tracking
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

async function makeCommit() {
    // Cek apakah harus commit sekarang DULU sebelum menulis log apapun
    if (!shouldCommitNow()) {
        console.log('⏭️  Skipping commit this time - maintaining natural frequency');
        console.log('📊 Daily commit frequency management active');
        return; // Keluar tanpa menulis log ke file
    }

    // Baru tulis log kalau memang akan commit
    addLog('🤖 Bot execution started', 'SYSTEM');
    
    // Generate aktivitas dan log
    const activity = getRandomActivity();
    addLog(`🎯 Started working on: ${activity}`, 'ACTIVITY');
    
    // Simulasi progress dengan beberapa log entries
    const progressMessages = [
        '🔍 Analyzing requirements',
        '⚡ Implementing solution', 
        '🧪 Running tests',
        '✅ Task completed successfully'
    ];
    
    // Random progress logs (1-3 entries)
    const numLogs = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numLogs; i++) {
        if (i < progressMessages.length) {
            addLog(progressMessages[i], 'PROGRESS');
        }
    }

    try {
        // Configure git identity terlebih dahulu
        await git.addConfig('user.name', 'iam-rizz');
        await git.addConfig('user.email', 'rizky@mct.co.id');
        addLog('⚙️  Git identity configured', 'GIT');
        
        // Fetch repository URL
        const remote = await git.remote(['-v']);
        addLog('🔗 Connected to repository', 'GIT');

        // Git operations dengan commit message random
        const commitMsg = getRandomCommitMessage();
        addLog(`📝 Preparing commit: "${commitMsg}"`, 'GIT');
        
        await git.add('./*');
        addLog('📦 Files staged for commit', 'GIT');
        
        await git.commit(commitMsg);
        addLog('💾 Changes committed locally', 'GIT');
        
        await git.push('origin', 'main');
        addLog('🚀 Changes pushed to remote repository', 'SUCCESS');
        
        addLog(`✨ Commit completed successfully: "${commitMsg}"`, 'SUCCESS');
        
    } catch (error) {
        addLog(`❌ Git operation failed: ${error.message}`, 'ERROR');
        console.error('Failed to commit and push changes:', error);
    }
    
    addLog('🏁 Bot execution finished', 'SYSTEM');
    addLog('─'.repeat(60), 'SEPARATOR');
}

makeCommit();