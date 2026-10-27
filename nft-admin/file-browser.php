<?php
/**
 * NFT 数字藏品后台 - 文件预览器
 * 快速浏览项目代码，纯 PHP 单文件实现
 */

$root = __DIR__;
$target = $_GET['file'] ?? '';
$action = $_GET['action'] ?? 'list';

// 预定义的 NFT 业务核心路径（优先展示）
$nftDirs = [
    '控制器'   => 'application/admin/controller/nft',
    '模型'     => 'application/admin/model/nft',
    '视图模板' => 'application/admin/view/nft',
    'JS 前端'  => 'public/assets/js/backend/nft',
    '服务层'   => 'application/common/service',
    '数据库'   => 'database/nft',
    '配置'     => 'application/extra/nft.php',
    '语言包'   => 'application/admin/lang/zh-cn/nft.php',
];

function fmtSize($bytes) {
    if ($bytes < 1024) return "$bytes B";
    if ($bytes < 1048576) return round($bytes/1024, 1) . " KB";
    return round($bytes/1048576, 1) . " MB";
}

function iconFor($ext) {
    $map = ['php'=>'🐘','js'=>'📜','sql'=>'🗄️','css'=>'🎨','html'=>'📄','json'=>'📋','md'=>'📝'];
    return $map[strtolower($ext)] ?? '📄';
}

function highlightPhp($code) {
    $code = htmlspecialchars($code, ENT_QUOTES);
    // 行号
    $lines = explode("\n", $code);
    $max = strlen((string)count($lines));
    $html = '';
    foreach ($lines as $i => $line) {
        $ln = str_pad($i+1, $max, ' ', STR_PAD_LEFT);
        $html .= "<div class='line'><span class='ln'>$ln</span><span class='code'>$line</span></div>";
    }
    return $html;
}

function listDir($path, $baseDir) {
    $full = $baseDir . '/' . $path;
    if (!is_dir($full)) return [];
    $items = [];
    foreach (scandir($full) as $name) {
        if ($name === '.' || $name === '..') continue;
        $fp = $full . '/' . $name;
        $rel = $path === '.' ? $name : "$path/$name";
        $items[] = [
            'name' => $name,
            'path' => $rel,
            'is_dir' => is_dir($fp),
            'size' => is_file($fp) ? filesize($fp) : 0,
            'ext' => pathinfo($name, PATHINFO_EXTENSION),
            'mtime' => date('Y-m-d H:i', filemtime($fp)),
        ];
    }
    // 目录优先
    usort($items, fn($a,$b) => ($b['is_dir']??0) - ($a['is_dir']??0) || strcmp($a['name'], $b['name']));
    return $items;
}

// 安全校验：禁止 ../ 和绝对路径
if ($target && str_contains($target, '..')) {
    $target = '';
}

// 读取文件内容
$content = '';
$ext = '';
$relPath = '';
if ($target && $action === 'view') {
    $fp = realpath($root . '/' . $target);
    if ($fp && str_starts_with($fp, realpath($root)) && is_file($fp)) {
        $content = file_get_contents($fp);
        $ext = pathinfo($fp, PATHINFO_EXTENSION);
        $relPath = $target;
    } else {
        $content = '⚠️ 无法读取文件：' . htmlspecialchars($target);
    }
}

// 根目录 = NFT 核心目录
$listTarget = $_GET['dir'] ?? 'application/admin/controller/nft';
if (!is_dir($root . '/' . $listTarget)) $listTarget = 'application/admin/controller/nft';
$currentItems = listDir($listTarget, $root);
$breadcrumbs = explode('/', $listTarget);
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>数字藏品后台 · 代码预览</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", Arial, sans-serif; background:#0f172a; color:#e2e8f0; height:100vh; display:flex; flex-direction:column; }
.header { background: linear-gradient(135deg,#1e293b,#334155); padding:16px 24px; border-bottom:1px solid #334155; display:flex; align-items:center; gap:16px; }
.header h1 { font-size:18px; color:#fbbf24; }
.header .sub { color:#94a3b8; font-size:13px; margin-left:auto; }
.layout { display:flex; flex:1; overflow:hidden; }
.sidebar { width:280px; background:#1e293b; border-right:1px solid #334155; overflow-y:auto; }
.sidebar .sec { padding:8px 0; border-bottom:1px solid #334155; }
.sidebar .sec h3 { padding:8px 16px; font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:1px; }
.sidebar .sec a { display:block; padding:8px 16px 8px 32px; color:#cbd5e1; text-decoration:none; font-size:13px; transition:all .15s; }
.sidebar .sec a:hover { background:#334155; color:#fbbf24; }
.sidebar .sec a.active { background:#fbbf24; color:#0f172a; font-weight:600; }
.main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
.toolbar { padding:12px 20px; background:#1e293b; border-bottom:1px solid #334155; display:flex; align-items:center; gap:12px; font-size:13px; }
.toolbar .crumbs { color:#94a3b8; }
.toolbar .crumbs span { color:#fbbf24; }
.file-list { flex:1; overflow-y:auto; padding:16px; }
.file-list table { width:100%; border-collapse:collapse; }
.file-list th { text-align:left; padding:10px 12px; color:#64748b; font-size:12px; text-transform:uppercase; background:#1e293b; position:sticky; top:0; }
.file-list td { padding:10px 12px; border-bottom:1px solid #1e293b; }
.file-list tr:hover td { background:#1e293b; }
.file-list a { color:#60a5fa; text-decoration:none; font-family:monospace; font-size:13px; }
.file-list a:hover { color:#fbbf24; }
.file-list .size { color:#64748b; font-size:12px; text-align:right; font-family:monospace; }
.file-list .mtime { color:#64748b; font-size:12px; }
.code-panel { flex:1; overflow:hidden; display:flex; flex-direction:column; }
.code-header { padding:10px 20px; background:#1e293b; border-bottom:1px solid #334155; display:flex; align-items:center; gap:10px; }
.code-header .file-name { font-family:monospace; color:#fbbf24; font-size:14px; font-weight:600; }
.code-header .meta { color:#64748b; font-size:12px; }
.code-content { flex:1; overflow:auto; background:#0a0f1a; padding:16px 20px; }
.code-content .line { display:flex; font-family: "JetBrains Mono", Consolas, "Courier New", monospace; font-size:12.5px; line-height:1.55; }
.code-content .ln { width:50px; text-align:right; color:#475569; flex-shrink:0; padding-right:12px; user-select:none; }
.code-content .code { color:#cbd5e1; white-space:pre; flex:1; }
.code-content .line:hover { background:#1e293b; }
.empty { flex:1; display:flex; align-items:center; justify-content:center; color:#64748b; flex-direction:column; gap:16px; }
.empty .big { font-size:48px; }
.badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; background:#334155; color:#cbd5e1; }
.btn { padding:6px 14px; border-radius:6px; background:#fbbf24; color:#0f172a; border:none; cursor:pointer; font-size:13px; text-decoration:none; display:inline-block; }
.btn:hover { opacity:.9; }
.stats { display:flex; gap:16px; padding:12px 20px; background:linear-gradient(135deg,#1e293b,#334155); border-bottom:1px solid #334155; font-size:13px; }
.stats span { color:#94a3b8; }
.stats b { color:#fbbf24; margin-left:6px; }
.nft-only tbody tr td:nth-child(2) { font-family:monospace; }
</style>
</head>
<body>

<div class="header">
    <h1>💎 数字藏品后台 · 代码预览器</h1>
    <div class="sub">基于 FastAdmin + ThinkPHP · 64 个业务文件</div>
</div>

<!-- 统计条 -->
<div class="stats">
    <span>控制器 <b>11</b></span>
    <span>模型 <b>12</b></span>
    <span>视图 <b>24</b></span>
    <span>JS <b>10</b></span>
    <span>SQL <b>2</b></span>
    <span>服务 <b>3</b></span>
    <span>配置 <b>2</b></span>
</div>

<div class="layout">

<!-- 左侧导航 -->
<div class="sidebar">
    <?php foreach ($nftDirs as $label => $dir): ?>
    <div class="sec">
        <h3><?=$label?></h3>
        <?php if (is_dir($root.'/'.$dir)): ?>
            <?php foreach (scandir($root.'/'.$dir) as $f): ?>
            <?php if ($f === '.' || $f === '..') continue; $fp = $root.'/'.$dir.'/'.$f; ?>
            <?php if (is_dir($fp)): ?>
                <a href="?dir=<?=urlencode($dir.'/'.$f)?>">📁 <?=$f?></a>
            <?php else: ?>
                <a href="?action=view&file=<?=urlencode($dir.'/'.$f)?>"><?=iconFor(pathinfo($f, PATHINFO_EXTENSION))?> <?=$f?></a>
            <?php endif; ?>
            <?php endforeach; ?>
        <?php else: ?>
            <a href="?action=view&file=<?=urlencode($dir)?>"><?=iconFor(pathinfo($dir, PATHINFO_EXTENSION))?> <?=basename($dir)?></a>
        <?php endif; ?>
    </div>
    <?php endforeach; ?>
</div>

<!-- 主内容区 -->
<div class="main">

<?php if ($action === 'view' && $relPath): ?>
    <!-- 代码查看 -->
    <div class="code-panel">
        <div class="code-header">
            <span class="file-name"><?=$relPath?></span>
            <span class="meta"><?=count(explode("\n",$content))?> 行 · <?=fmtSize(strlen($content))?></span>
            <a class="btn" href="?dir=<?=urlencode(dirname($relPath))?>" style="margin-left:auto">📁 返回目录</a>
        </div>
        <div class="code-content"><?=highlightPhp($content)?></div>
    </div>

<?php else: ?>
    <!-- 文件列表 -->
    <div class="toolbar">
        <div class="crumbs">📍 
            <?php foreach ($breadcrumbs as $i=>$cr): ?>
                <?php if ($i === 0): ?>
                    <a href="?" style="color:#fbbf24;text-decoration:none">根目录</a>
                <?php else: ?>
                    / <?=htmlspecialchars($cr)?>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
        <div style="margin-left:auto;color:#64748b">共 <?=count($currentItems)?> 项</div>
    </div>
    <div class="file-list">
        <table>
            <thead><tr><th width="36">类型</th><th>名称</th><th width="100" style="text-align:right">大小</th><th width="140">修改时间</th></tr></thead>
            <tbody>
            <?php foreach ($currentItems as $it): ?>
            <tr>
                <td><?=$it['is_dir'] ? '📁' : iconFor($it['ext'])?></td>
                <td>
                    <?php if ($it['is_dir']): ?>
                        <a href="?dir=<?=urlencode($listTarget.'/'.$it['name'])?>"><?=htmlspecialchars($it['name'])?>/</a>
                    <?php else: ?>
                        <a href="?action=view&file=<?=urlencode($listTarget.'/'.$it['name'])?>"><?=htmlspecialchars($it['name'])?></a>
                    <?php endif; ?>
                </td>
                <td class="size"><?=$it['is_dir'] ? '-' : fmtSize($it['size'])?></td>
                <td class="mtime"><?=$it['mtime']?></td>
            </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
<?php endif; ?>

</div>
</div>

</body>
</html>
