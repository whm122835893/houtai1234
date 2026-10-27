#!/usr/bin/env bash
# =============================================================================
# FastAdmin 数字藏品后台 —— 一键环境重建脚本
#
# 用途：从仓库克隆代码后，自动补齐运行所需的一切（框架入口、依赖、前端库、
#      .env、数据库与演示数据），最后启动内置服务器。
#
# 用法：
#   ./setup.sh                    # 全量重建（会 DROP 并重建数据库）
#   KEEP_DB=1 ./setup.sh          # 保留已有数据库，只补环境
#   SKIP_BUILD=1 ./setup.sh       # 跳过 composer / npm 构建（已装过时用）
#   SKIP_DB=1 ./setup.sh          # 跳过数据库初始化
#   SKIP_SERVER=1 ./setup.sh      # 只准备环境，不启动服务
#
# 可覆盖的环境变量：
#   PORT=8080              服务端口
#   DB_HOST=127.0.0.1      数据库地址
#   DB_PORT=3306           数据库端口
#   DB_NAME=fastadmin      数据库名
#   DB_USER=fastadmin      数据库用户
#   DB_PASS=fastadmin123   数据库密码
#   MYSQL_ADMIN=root       用于建库的管理员账号
#   MYSQL_ADMIN_PASS=      管理员密码（空则用本地 socket 免密）
#   ADMIN_USER=admin       后台账号
#   ADMIN_PASS=admin123    后台密码
#   PHP_BIN=/path/to/php   指定 PHP 可执行文件
# =============================================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

PORT="${PORT:-8080}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-fastadmin}"
DB_USER="${DB_USER:-fastadmin}"
DB_PASS="${DB_PASS:-fastadmin123}"
MYSQL_ADMIN="${MYSQL_ADMIN:-root}"
MYSQL_ADMIN_PASS="${MYSQL_ADMIN_PASS:-}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin123}"

KEEP_DB="${KEEP_DB:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
SKIP_DB="${SKIP_DB:-0}"
SKIP_SERVER="${SKIP_SERVER:-0}"

log()  { printf '\033[1;32m[setup]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn ]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 0. 依赖检查
# ---------------------------------------------------------------------------
log "检查基础命令"
for c in composer node npm; do
    command -v "$c" >/dev/null 2>&1 || die "缺少命令：$c"
done

# 优先使用项目验证过的 PHP 8.2（更高版本可能触发严格模式报错）
find_php() {
    if [ -n "${PHP_BIN:-}" ]; then
        echo "$PHP_BIN"; return
    fi
    for candidate in /root/.phpenv/versions/8.2*/bin/php; do
        [ -x "$candidate" ] && { echo "$candidate"; return; }
    done
    command -v php 2>/dev/null || die "缺少命令：php"
}
PHP_BIN="$(find_php)"
PHP_VER="$("$PHP_BIN" -r 'echo PHP_VERSION;')"
log "PHP: $PHP_BIN ($PHP_VER)"

# ---------------------------------------------------------------------------
# 1. composer 依赖 + 框架入口目录
# ---------------------------------------------------------------------------
if [ "$SKIP_BUILD" != "1" ]; then
    log "安装 composer 依赖"
    composer install --no-interaction --no-progress

    log "安装前端依赖并构建静态库"
    npm install --ignore-scripts --no-audit --no-fund
    # summernote 不在 package.json 依赖里，需单独装（公告富文本编辑器要用）
    npm install summernote@0.8.20 --ignore-scripts --no-audit --no-fund
    ./node_modules/.bin/grunt
    mkdir -p public/assets/libs/summernote/dist
    cp -r node_modules/summernote/dist/. public/assets/libs/summernote/dist/
    log "前端库数量：$(ls public/assets/libs | wc -l)"
else
    log "跳过构建（SKIP_BUILD=1）"
fi

# FastAdmin 入口文件 require 的是 ./thinkphp/base.php，composer 装在 vendor 下，需补一份
if [ ! -f thinkphp/base.php ]; then
    log "补齐框架入口目录 thinkphp/"
    cp -r vendor/topthink/framework thinkphp
fi
[ -f thinkphp/base.php ] || die "thinkphp/base.php 缺失，无法启动"
[ -f vendor/autoload.php ] || die "vendor/autoload.php 缺失，请先执行 composer install"

# ---------------------------------------------------------------------------
# 2. .env 配置
# ---------------------------------------------------------------------------
if [ ! -f .env ]; then
    log "生成 .env"
    cat > .env <<EOF
[app]
debug = true

[database]
type = mysql
hostname = ${DB_HOST}
database = ${DB_NAME}
username = ${DB_USER}
password = ${DB_PASS}
hostport = ${DB_PORT}
charset = utf8mb4
prefix = fa_
EOF
else
    log ".env 已存在，跳过生成"
fi

# ---------------------------------------------------------------------------
# 3. 数据库：建库、建用户、按顺序导入 SQL
# ---------------------------------------------------------------------------
mysql_admin() {
    if [ -n "$MYSQL_ADMIN_PASS" ]; then
        MYSQL_PWD="$MYSQL_ADMIN_PASS" mysql -h"$DB_HOST" -P"$DB_PORT" -u"$MYSQL_ADMIN" "$@"
    else
        # 管理员免密时走本地 socket，避免 root@127.0.0.1 认证失败
        mysql -u "$MYSQL_ADMIN" "$@"
    fi
}

# 单个 SQL 文件导入；使用 --force 容忍“列/表已存在”之类的可忽略错误
import_sql() {
    local file="$1"
    [ -f "$file" ] || { warn "SQL 不存在，跳过：$file"; return 0; }
    local err
    err="$(MYSQL_PWD="$DB_PASS" mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" \
            --force "$DB_NAME" < "$file" 2>&1 | grep -icE '^ERROR' || true)"
    if [ "${err:-0}" -gt 0 ]; then
        warn "$(basename "$file") 出现 $err 条可忽略错误（通常为字段已存在）"
    fi
}

if [ "$SKIP_DB" != "1" ]; then
    log "初始化数据库 $DB_NAME"
    if [ "$KEEP_DB" != "1" ]; then
        mysql_admin -e "DROP DATABASE IF EXISTS \`$DB_NAME\`;"
    fi
    mysql_admin -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    mysql_admin -e "
        CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
        CREATE USER IF NOT EXISTS '$DB_USER'@'127.0.0.1' IDENTIFIED BY '$DB_PASS';
        GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
        GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'127.0.0.1';
        FLUSH PRIVILEGES;"

    # 导入顺序不可乱：核心表在 fastadmin.sql，NFT 业务表与菜单在 database/nft 下
    for f in \
        application/admin/command/Install/fastadmin.sql \
        database/nft/nft.sql \
        database/nft/menu.sql \
        database/nft/upgrade_v2.sql \
        database/nft/upgrade_v3.sql \
        database/nft/upgrade_v4.sql \
        database/nft/demo.sql
    do
        log "导入 $(basename "$f")"
        import_sql "$f"
    done

    log "重置后台账号 $ADMIN_USER / $ADMIN_PASS"
    SALT="$("$PHP_BIN" -r 'echo substr(md5(uniqid()),0,6);')"
    HASH="$("$PHP_BIN" -r "echo md5(md5('$ADMIN_PASS') . '$SALT');")"
    MYSQL_PWD="$DB_PASS" mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" \
        -e "UPDATE fa_admin SET password='$HASH', salt='$SALT', status='normal' WHERE username='$ADMIN_USER';"

    TABLE_CNT="$(MYSQL_PWD="$DB_PASS" mysql -N -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" \
        -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME';")"
    log "数据库就绪，共 $TABLE_CNT 张表"
else
    log "跳过数据库初始化（SKIP_DB=1）"
fi

# ---------------------------------------------------------------------------
# 4. 启动内置服务器
# ---------------------------------------------------------------------------
mkdir -p runtime
if [ "$SKIP_SERVER" != "1" ]; then
    log "启动服务：http://localhost:$PORT/admin.php"
    "$PHP_BIN" -S "0.0.0.0:$PORT" -t "$PROJECT_DIR/public" "$PROJECT_DIR/public/router.php" \
        > runtime/server.log 2>&1 &
    SERVER_PID=$!
    echo "$SERVER_PID" > runtime/server.pid
    sleep 2
    if kill -0 "$SERVER_PID" 2>/dev/null; then
        log "服务已启动（PID $SERVER_PID，日志 runtime/server.log）"
    else
        die "服务启动失败，请查看 runtime/server.log"
    fi
    echo
    echo "  地址：http://localhost:$PORT/admin.php"
    echo "  账号：$ADMIN_USER / $ADMIN_PASS"
else
    log "跳过启动服务（SKIP_SERVER=1）"
fi

log "完成"
