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
            targetCommits: Math.floor(Math.random() * 7) + 6 // Random 6-12
        };
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

async function makeCommit() {
    // Cek apakah harus commit sekarang
    if (!shouldCommitNow()) {
        console.log('Skipping commit this time - maintaining natural frequency');
        return;
    }

    // Update file dengan konten yang lebih natural
    const filePath = path.join(__dirname, 'daily_update.txt');
    const timestamp = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: 'short', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    
    const activity = getRandomActivity();
    const updateContent = `[${timestamp} WIB] Completed ${activity}\n`;
    
    fs.appendFileSync(filePath, updateContent);
    console.log(`Added activity: ${activity}`);

    try {
        // Fetch repository URL
        const remote = await git.remote(['-v']);
        console.log('Repository URL:', remote);

        // Git operations dengan commit message random
        const commitMsg = getRandomCommitMessage();
        await git.add('./*');
        await git.commit(commitMsg);
        await git.push('origin', 'main');
        
        console.log(`✅ Successfully committed with message: "${commitMsg}"`);
    } catch (error) {
        console.error('Failed to commit and push changes:', error);
    }
}

makeCommit();