/*
 * NFT Dashboard JS — SaaS 仪表盘（对齐参考图 Jualin）
 * 4 统计卡（带右上角图标 + 迷你面积图）+ Revenue 双折线 + Status 圆环 + Tracking 小面板 + Recent Order
 */
define(['jquery', 'bootstrap', 'backend', 'addtabs', 'table', 'echarts'], function ($, undefined, Backend, Datatable, Table, Echarts) {

    var Controller = {
        index: function () {

            // ======= 格式化工具 =======
            function fmtMoney(n) {
                if (!n && n !== 0) return '-';
                n = parseFloat(n);
                if (Math.abs(n) >= 100000000) return '¥' + (n / 100000000).toFixed(2) + '亿';
                if (Math.abs(n) >= 10000) return '¥' + (n / 10000).toFixed(2) + 'w';
                return '¥' + n.toFixed(2);
            }
            function fmtInt(n) {
                if (!n && n !== 0) return '-';
                n = parseInt(n);
                if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
                return String(n);
            }
            function fmtPct(n) {
                if (!n && n !== 0) return '-';
                return (n >= 0 ? '+' : '') + n.toFixed(1) + '% LAST WEEK';
            }
            function fmtTime(ts) {
                if (!ts) return '-';
                var d = new Date(parseInt(ts) * 1000);
                var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
                return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
            }

            // ======= SVG 迷你面积图 =======
            function buildSpark(values, w, h) {
                w = w || 160; h = h || 44;
                if (!values || !values.length) return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none"></svg>';
                var max = Math.max.apply(null, values);
                var min = Math.min.apply(null, values);
                var range = max - min || 1;
                var stepX = w / (values.length - 1 || 1);
                var pts = [];
                values.forEach(function (v, i) {
                    var x = i * stepX;
                    var y = h - 2 - ((v - min) / range) * (h - 6);
                    pts.push([x, y]);
                });
                var d = '';
                for (var i = 0; i < pts.length; i++) {
                    var p = pts[i];
                    if (i === 0) d += 'M' + p[0] + ',' + p[1];
                    else {
                        var p0 = pts[i - 1];
                        var xc = (p0[0] + p[0]) / 2;
                        d += ' C' + xc + ',' + p0[1] + ' ' + xc + ',' + p[1] + ' ' + p[0] + ',' + p[1];
                    }
                }
                var areaD = d + ' L' + w + ',' + h + ' L0,' + h + ' Z';
                return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
                       '<path d="' + areaD + '"/>' +
                       '</svg>';
            }

            // ======= Status 状态映射 — 对齐参考图 pill 颜色 =======
            var STATUS_PILL = {
                pending:    { cls: 'pill-orange', text: 'Pending' },
                paid:       { cls: 'pill-blue',   text: 'Paid' },
                completed:  { cls: 'pill-green',  text: 'On Delivery' },
                refunding:  { cls: 'pill-red',    text: 'Refunding' },
                canceled:   { cls: 'pill-red',    text: 'Canceled' },
                delivered:  { cls: 'pill-green',  text: 'Delivered' }
            };
            function pillOf(s) { return STATUS_PILL[s] || { cls: 'pill-blue', text: s || 'Unknown' }; }

            // ======= 1. 拉统计 + 填充 4 卡 =======
            Fast.api.ajax({
                url: 'nft/dashboard/stats',
                loading: false
            }, function (ret) {
                if (ret.code !== 1 || !ret.data) return;
                var d = ret.data;

                $('#card-revenue').text(fmtMoney(d.total_sales || 0));
                $('#card-revenue-change').text(fmtPct(d.revenue_change || 0));
                $('#spark-revenue').html(buildSpark(d.revenue_trend || []));

                $('#card-users').text(fmtInt(d.user_count || 0));
                $('#card-users-change').text(fmtPct(d.users_change || 0));
                $('#spark-users').html(buildSpark(d.users_trend || []));

                $('#card-collections').text(fmtInt(d.on_sale_count || 0));
                $('#card-collections-change').text(fmtPct(d.collections_change || 0));
                $('#spark-collections').html(buildSpark(d.collections_trend || []));

                $('#card-chain').text(fmtInt(d.total_user_collections || 0));
                $('#card-chain-change').text(fmtPct(d.chain_change || 0));
                $('#spark-chain').html(buildSpark(d.chain_trend || []));
            });

            // ======= 2. 拉趋势 + 渲染 Revenue 双折线 =======
            var revenueChart;
            Fast.api.ajax({
                url: 'nft/dashboard/trend',
                loading: false
            }, function (ret) {
                if (ret.code !== 1 || !ret.data) return;
                var d = ret.data;
                revenueChart = Echarts.init(document.getElementById('revenue-chart'));

                // Income 渐变 — 参考图绿色填充
                var greenGrad = revenueChart.createLinearGradient(0, 0, 0, 300);
                greenGrad.addColorStop(0, 'rgba(53,199,154,0.32)');
                greenGrad.addColorStop(1, 'rgba(53,199,154,0.02)');
                // Outcome 渐变
                var redGrad = revenueChart.createLinearGradient(0, 0, 0, 300);
                redGrad.addColorStop(0, 'rgba(232,106,106,0.22)');
                redGrad.addColorStop(1, 'rgba(232,106,106,0.02)');

                var option = {
                    grid: { left: 18, right: 14, top: 14, bottom: 16, containLabel: true },
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        textStyle: { color: '#1F2937' },
                        axisPointer: { type: 'line', lineStyle: { color: '#E5E7EB', type: 'dashed' } },
                        formatter: function (params) {
                            var tip = '<div class="revenue-tooltip" style="min-width:140px;">';
                            tip += '<div style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;margin-bottom:4px;">' + params[0].axisValue + '</div>';
                            params.forEach(function (p) {
                                var dot = p.seriesName === 'Income'
                                    ? '<span class="tip-dot" style="background:#35C79A"></span>'
                                    : '<span class="tip-dot" style="background:#E86A6A"></span>';
                                tip += '<div class="tip-row"><span><span class="tip-label">' + dot + p.seriesName + '</span></span><span class="tip-value">¥' + p.value.toFixed(2) + '</span></div>';
                            });
                            tip += '</div>';
                            return tip;
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: d.days,
                        axisLine: { lineStyle: { color: '#E5E7EB' } },
                        axisTick: { show: false },
                        axisLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: 600 }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#F1F5F9', type: 'dashed' } },
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: 600 }
                    },
                    series: [
                        {
                            name: 'Income',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 7,
                            showSymbol: false,
                            lineStyle: { color: '#35C79A', width: 3.5, shadowColor: 'rgba(53,199,154,0.25)', shadowBlur: 6 },
                            itemStyle: { color: '#35C79A' },
                            areaStyle: { color: greenGrad },
                            data: d.income || d.sales_amount || []
                        },
                        {
                            name: 'Outcome',
                            type: 'line',
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 7,
                            showSymbol: false,
                            lineStyle: { color: '#E86A6A', width: 3 },
                            itemStyle: { color: '#E86A6A' },
                            areaStyle: { color: redGrad },
                            data: d.outcome || d.refund_amount || []
                        }
                    ]
                };
                revenueChart.setOption(option);
            });

            // ======= 3. Status 圆环 — 对齐参考图粉紫蓝绿 4 段 =======
            var statusChart;
            Fast.api.ajax({
                url: 'nft/dashboard/status',
                loading: false
            }, function (ret) {
                if (ret.code !== 1 || !ret.data) return;
                var s = ret.data;

                $('#sm-booked').text(s.booked || 0);
                $('#sm-progress').text(s.progress || 0);
                $('#sm-canceled').text(s.canceled || 0);

                var total = (s.received || 0) + (s.booked || 0) + (s.progress || 0) + (s.canceled || 0);
                var pct = total ? Math.round(((s.received || 0) / total) * 100) : 0;
                $('#status-big-num').text(pct + '%');

                statusChart = Echarts.init(document.getElementById('status-chart'));
                var opt = {
                    tooltip: { show: true, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                    series: [{
                        type: 'pie',
                        radius: ['55%', '82%'],
                        center: ['50%', '50%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 5,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: { show: false },
                        labelLine: { show: false },
                        data: [
                            { value: s.received || 0,  name: 'Received',  itemStyle: { color: '#FF6B9D' } },
                            { value: s.booked || 0,    name: 'Booked',    itemStyle: { color: '#A55EEA' } },
                            { value: s.progress || 0,  name: 'Progress',  itemStyle: { color: '#6C5CE7' } },
                            { value: s.canceled || 0,  name: 'Canceled',  itemStyle: { color: '#2ED9A5' } }
                        ]
                    }]
                };
                statusChart.setOption(opt);
            });
            // ======= 4. Recent Orders =======
            Fast.api.ajax({
                url: 'nft/dashboard/recent',
                loading: false
            }, function (ret) {
                if (ret.code !== 1 || !ret.data) return;
                var orders = ret.data.orders || [];
                if (!orders.length) {
                    $('#recent-orders').html('<tr><td colspan="6" style="text-align:center;color:#9CA3AF;padding:30px;">暂无订单数据</td></tr>');
                    return;
                }
                var rows = '';
                orders.forEach(function (o) {
                    var p = pillOf(o.status);
                    rows += '<tr>' +
                        '<td style="font-weight:600;color:#1F2937;">#' + (o.order_no || o.id) + '</td>' +
                        '<td>' + (o.user && o.user.nickname ? o.user.nickname : '用户#' + (o.user_id || '')) + '</td>' +
                        '<td>' + (o.collection && o.collection.name ? o.collection.name : (o.collection_id ? '藏品#' + o.collection_id : '-')) + '</td>' +
                        '<td style="font-weight:600;">¥' + (parseFloat(o.pay_price || o.total_price || 0).toFixed(2)) + '</td>' +
                        '<td><span class="order-pill ' + p.cls + '">' + p.text + '</span></td>' +
                        '<td style="color:#9CA3AF;">' + fmtTime(o.createtime) + '</td>' +
                        '</tr>';
                });
                $('#recent-orders').html(rows);
            });

                $('#recent-orders').html(rows);
            });

            // ======= 5. addtabs 链接委托 =======
            $(document).on('click', '.dash-panel a[data-href]', function (e) {
                e.preventDefault();
                var url = 'nft/' + $(this).data('href');
                Fast.api.addtabs(url);
            });

            // ======= 6. 窗口 resize 重新渲染图表 =======
            $(window).on('resize', function () {
                if (revenueChart) revenueChart.resize();
                if (statusChart) statusChart.resize();
            });
        }
    };
    return Controller;
});
