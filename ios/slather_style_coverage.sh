#!/bin/bash

echo "🚀 Slather風カバレッジレポート生成スクリプト"

# 最新のテスト結果を探す
XCRESULT=$(find ~/Library/Developer/Xcode/DerivedData -name "*.xcresult" -type d | head -1)

if [ -z "$XCRESULT" ]; then
    echo "❌ テスト結果が見つかりません。先に yarn ios:ut を実行してください。"
    exit 1
fi

echo "📊 テスト結果を発見: $XCRESULT"

# カバレッジディレクトリを作成
mkdir -p coverage

# カバレッジデータをJSONで出力
echo "📄 カバレッジデータを抽出中..."
xcrun xccov view --report --json "$XCRESULT" > coverage/coverage.json

# HTMLレポートを生成
echo "🎨 HTMLレポートを生成中..."

# coverage.jsonの内容を読み込む
COVERAGE_DATA=$(cat coverage/coverage.json)

# HTMLレポートを生成（coverage.jsonをインラインで埋め込む）
cat > coverage/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OnlineCalendar Coverage Report - Slather Style</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
        }
        
        header {
            background: #333;
            color: white;
            padding: 20px 0;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 300;
        }
        
        .report-box {
            background: white;
            margin: 20px auto;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h2 {
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #333;
        }
        
        .summary {
            margin: 20px 0;
        }
        
        .summary h4 {
            margin: 10px 0;
            font-weight: normal;
            color: #666;
            font-size: 16px;
        }
        
        .cov_high { color: #27ae60; font-weight: 600; }
        .cov_medium { color: #f39c12; font-weight: 600; }
        .cov_low { color: #e74c3c; font-weight: 600; }
        
        .search-box {
            margin: 20px 0;
        }
        
        .search-box input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th {
            background: #f8f8f8;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #ddd;
            color: #333;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
        }
        
        tr:hover {
            background: #f8f8f8;
        }
        
        .col-num {
            width: 50px;
            text-align: center;
            color: #999;
        }
        
        .col-percent {
            width: 80px;
            text-align: right;
        }
        
        .col-lines {
            width: 80px;
            text-align: right;
            color: #666;
        }
        
        .col-relevant {
            width: 80px;
            text-align: right;
            color: #666;
        }
        
        .col-covered {
            width: 80px;
            text-align: right;
            color: #666;
        }
        
        .col-missed {
            width: 80px;
            text-align: right;
            color: #666;
        }
        
        .file-path {
            font-family: 'SF Mono', Monaco, Consolas, monospace;
            font-size: 13px;
            color: #2479cc;
        }
        
        footer {
            background: #333;
            color: white;
            padding: 20px 0;
            margin-top: 40px;
            text-align: center;
        }
        
        footer a {
            color: white;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>OnlineCalendar.xcodeproj</h1>
        </div>
    </header>
    
    <div class="container">
        <div class="report-box">
            <h2>Test Coverage</h2>
            <div class="summary">
                <h4>Total Coverage : <span id="totalCoverage" class="cov_low">0.00%</span></h4>
            </div>
            
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search files..." />
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th class="col-num">#</th>
                        <th>File</th>
                        <th class="col-percent">%</th>
                        <th class="col-lines">Lines</th>
                        <th class="col-relevant">Relevant</th>
                        <th class="col-covered">Covered</th>
                        <th class="col-missed">Missed</th>
                    </tr>
                </thead>
                <tbody id="fileList"></tbody>
            </table>
        </div>
    </div>
    
    <footer>
        <div class="container">
            <p>Generated by slather-style coverage reporter</p>
        </div>
    </footer>
    
    <script>
        // coverage.jsonをインラインで埋め込む
        const coverageData = $COVERAGE_DATA;
        
        async function loadCoverage() {
            try {
                const data = coverageData;
                
                // プロジェクトファイルのみのカバレッジを計算
                let projectCoveredLines = 0;
                let projectExecutableLines = 0;
                
                data.targets.forEach(target => {
                    // ViewInspectorのターゲットは除外
                    if (target.name && target.name.includes('ViewInspector')) {
                        return;
                    }
                    
                    target.files.forEach(file => {
                        // ViewInspector、APIClient、Repositoryのファイルパスは除外
                        if (file.path.includes('ViewInspector') || 
                            file.path.includes('PackageFrameworks') ||
                            file.path.includes('.build') ||
                            file.path.includes('APIClient.swift') ||
                            file.path.includes('Repository.swift')) {
                            return;
                        }
                        
                        if (file.path.endsWith('.swift')) {
                            projectCoveredLines += file.coveredLines;
                            projectExecutableLines += file.executableLines;
                        }
                    });
                });
                
                // プロジェクトファイルのみのカバレッジを表示
                const totalCoverage = projectExecutableLines > 0 
                    ? (projectCoveredLines / projectExecutableLines * 100).toFixed(2)
                    : '0.00';
                const totalElement = document.getElementById('totalCoverage');
                totalElement.textContent = totalCoverage + '%';
                
                // カバレッジレベルに応じてクラスを設定
                if (totalCoverage >= 80) {
                    totalElement.className = 'cov_high';
                } else if (totalCoverage >= 50) {
                    totalElement.className = 'cov_medium';
                } else {
                    totalElement.className = 'cov_low';
                }
                
                // ファイル情報を収集（ViewInspectorを除外）
                const files = [];
                data.targets.forEach(target => {
                    // ViewInspectorのターゲットは除外
                    if (target.name && target.name.includes('ViewInspector')) {
                        return;
                    }
                    
                    target.files.forEach(file => {
                        // ViewInspector、APIClient、Repositoryのファイルパスは除外
                        if (file.path.includes('ViewInspector') || 
                            file.path.includes('PackageFrameworks') ||
                            file.path.includes('.build') ||
                            file.path.includes('APIClient.swift') ||
                            file.path.includes('Repository.swift')) {
                            return;
                        }
                        
                        if (file.path.endsWith('.swift')) {
                            files.push({
                                path: file.path.replace(/.*\/OnlineCalendar\//, 'OnlineCalendar/'),
                                coverage: file.lineCoverage * 100,
                                lines: file.lines || 0,
                                relevant: file.executableLines,
                                covered: file.coveredLines,
                                missed: file.executableLines - file.coveredLines,
                                functions: file.functions || []
                            });
                        }
                    });
                });
                
                // パスでソート
                files.sort((a, b) => a.path.localeCompare(b.path));
                
                // テーブルに表示
                const tbody = document.getElementById('fileList');
                files.forEach((file, index) => {
                    const row = document.createElement('tr');
                    
                    // 番号
                    const numCell = document.createElement('td');
                    numCell.className = 'col-num';
                    numCell.textContent = index + 1;
                    row.appendChild(numCell);
                    
                    // ファイルパス（クリック可能）
                    const pathCell = document.createElement('td');
                    pathCell.className = 'file-path';
                    const pathLink = document.createElement('a');
                    pathLink.href = '#';
                    pathLink.textContent = file.path;
                    pathLink.style.cursor = 'pointer';
                    pathLink.onclick = function(e) {
                        e.preventDefault();
                        showFunctionDetails(file);
                    };
                    pathCell.appendChild(pathLink);
                    row.appendChild(pathCell);
                    
                    // カバレッジ率
                    const percentCell = document.createElement('td');
                    percentCell.className = 'col-percent';
                    const coverage = file.coverage.toFixed(2);
                    const span = document.createElement('span');
                    span.textContent = coverage + '%';
                    
                    if (coverage >= 80) {
                        span.className = 'cov_high';
                    } else if (coverage >= 50) {
                        span.className = 'cov_medium';
                    } else {
                        span.className = 'cov_low';
                    }
                    
                    percentCell.appendChild(span);
                    row.appendChild(percentCell);
                    
                    // 行数
                    const linesCell = document.createElement('td');
                    linesCell.className = 'col-lines';
                    linesCell.textContent = file.lines;
                    row.appendChild(linesCell);
                    
                    // 実行可能行数
                    const relevantCell = document.createElement('td');
                    relevantCell.className = 'col-relevant';
                    relevantCell.textContent = file.relevant;
                    row.appendChild(relevantCell);
                    
                    // カバー済み行数
                    const coveredCell = document.createElement('td');
                    coveredCell.className = 'col-covered';
                    coveredCell.textContent = file.covered;
                    row.appendChild(coveredCell);
                    
                    // 未カバー行数
                    const missedCell = document.createElement('td');
                    missedCell.className = 'col-missed';
                    missedCell.textContent = file.missed;
                    row.appendChild(missedCell);
                    
                    tbody.appendChild(row);
                });
                
                // 検索機能
                document.getElementById('searchInput').addEventListener('input', function(e) {
                    const searchTerm = e.target.value.toLowerCase();
                    const rows = tbody.getElementsByTagName('tr');
                    
                    for (let row of rows) {
                        const fileName = row.cells[1].textContent.toLowerCase();
                        row.style.display = fileName.includes(searchTerm) ? '' : 'none';
                    }
                });
                
            } catch (error) {
                console.error('カバレッジデータの読み込みに失敗しました:', error);
                document.getElementById('fileList').innerHTML = 
                    '<tr><td colspan="7" style="text-align: center; color: #e74c3c;">カバレッジデータの読み込みに失敗しました</td></tr>';
            }
        }
        
        // 関数レベルの詳細を表示する関数
        function showFunctionDetails(file) {
            // モーダルウィンドウを作成
            const modal = document.createElement('div');
            modal.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            \`;
            
            const modalContent = document.createElement('div');
            modalContent.style.cssText = \`
                background: white;
                padding: 30px;
                border-radius: 8px;
                max-width: 80%;
                max-height: 80%;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            \`;
            
            // 関数一覧を作成
            let functionsHtml = \`<h3>\${file.path} - Function Coverage</h3>\`;
            
            if (file.functions && file.functions.length > 0) {
                functionsHtml += \`
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background: #f8f8f8;">
                                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Function</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Line#</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Coverage</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Exec Count</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Lines</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Covered</th>
                                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Missed</th>
                            </tr>
                        </thead>
                        <tbody>
                \`;
                
                file.functions.forEach(func => {
                    const coverage = func.executableLines > 0 ? (func.coveredLines / func.executableLines * 100).toFixed(1) : '0.0';
                    const coverageClass = coverage >= 80 ? 'cov_high' : coverage >= 50 ? 'cov_medium' : 'cov_low';
                    
                    functionsHtml += \`
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 8px; font-family: 'SF Mono', monospace; font-size: 12px;">\${func.name}</td>
                            <td style="padding: 8px; text-align: right; color: #666;">\${func.lineNumber || '-'}</td>
                            <td style="padding: 8px; text-align: right;"><span class="\${coverageClass}">\${coverage}%</span></td>
                            <td style="padding: 8px; text-align: right; color: #666;">\${func.executionCount || 0}</td>
                            <td style="padding: 8px; text-align: right;">\${func.executableLines}</td>
                            <td style="padding: 8px; text-align: right;">\${func.coveredLines}</td>
                            <td style="padding: 8px; text-align: right;">\${func.executableLines - func.coveredLines}</td>
                        </tr>
                    \`;
                });
                
                functionsHtml += '</tbody></table>';
            } else {
                functionsHtml += '<p>No function details available for this file.</p>';
            }
            
            functionsHtml += \`
                <div style="margin-top: 20px; text-align: right;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="padding: 8px 16px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Close
                    </button>
                </div>
            \`;
            
            modalContent.innerHTML = functionsHtml;
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // モーダル外クリックで閉じる
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        // ページ読み込み時に実行
        loadCoverage();
    </script>
</body>
</html>
EOF

echo "✅ Slather風カバレッジレポートを生成しました: coverage/index.html"