const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');

const scriptContent = `    <script>
        function toggleCode(id) {
            const element = document.getElementById(id);
            if (element.classList.contains('hidden')) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        }

        document.addEventListener('DOMContentLoaded', function() {
            const dayNumber = window.location.pathname.match(/day(\\d+)/)[1];
            const completed = localStorage.getItem(\`day-\${dayNumber}-completed\`);
            if (completed === 'true') {
                document.getElementById('complete-btn').classList.add('bg-green-600');
                document.getElementById('complete-btn').classList.remove('bg-gray-600');
                document.getElementById('complete-btn').textContent = '✓ 已完成';
            }
        });

        function toggleComplete() {
            const dayNumber = window.location.pathname.match(/day(\\d+)/)[1];
            const btn = document.getElementById('complete-btn');
            const current = localStorage.getItem(\`day-\${dayNumber}-completed\`);
            if (current === 'true') {
                localStorage.setItem(\`day-\${dayNumber}-completed\`, 'false');
                btn.classList.remove('bg-green-600');
                btn.classList.add('bg-gray-600');
                btn.textContent = '标记完成';
            } else {
                localStorage.setItem(\`day-\${dayNumber}-completed\`, 'true');
                btn.classList.add('bg-green-600');
                btn.classList.remove('bg-gray-600');
                btn.textContent = '✓ 已完成';
            }
        }
    </script>`;

const styleAddition = `        .code-embed { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }`;

const navReplacement = `        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <a href="../index.html" class="text-gray-500 hover:text-gray-700">← 返回首页</a>
            <div class="flex gap-3">
                <button id="complete-btn" onclick="toggleComplete()" class="bg-gray-600 text-white px-5 py-2 rounded-lg hover:bg-gray-700 transition">
                    标记完成
                </button>
                {{NEXT_LINK}}
            </div>
        </div>`;

for (let day = 1; day <= 30; day++) {
    const filePath = path.join(pagesDir, `day${day}.html`);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // 添加CSS样式
        content = content.replace(/(\.gradient-bg[^}]+})/, `$1${styleAddition}`);
        
        // 添加脚本
        content = content.replace(/(<\/style>)/, `$1\n${scriptContent}`);
        
        // 更新导航区域
        const nextDay = day < 30 ? `<a href="day${day + 1}.html" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">下一天 →</a>` : '<span class="bg-gray-300 text-gray-500 px-6 py-2 rounded-lg">完成 🎉</span>';
        const navContent = navReplacement.replace('{{NEXT_LINK}}', nextDay);
        
        content = content.replace(/<div class="flex justify-between mt-8">[\s\S]*?<\/div>/, navContent);
        
        // 添加阅读指南
        const readingGuide = `            <!-- 阅读引导说明 -->
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <p class="text-blue-800 font-medium mb-2">📖 阅读指南</p>
                <ul class="text-blue-700 text-sm space-y-1">
                    <li>• 每个文件按标注顺序阅读</li>
                    <li>• 先快速浏览整体结构，再深入细节</li>
                    <li>• 关注代码中的设计决策，而不只是实现</li>
                    <li>• 遇到不懂的地方先记录，后续学习会逐步展开</li>
                    <li>• 完成后点击「标记完成」记录学习进度</li>
                </ul>
            </div>`;
        
        content = content.replace(/(<h2 class="text-xl font-bold text-gray-800 mb-4">📂 阅读文件<\/h2>)/, `$1\n${readingGuide}`);
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ 更新完成: day${day}.html`);
    }
}

console.log('\\n🎉 所有30天学习页面已成功增强！');
