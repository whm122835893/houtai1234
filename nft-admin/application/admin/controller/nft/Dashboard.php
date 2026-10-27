<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 数字藏品仪表盘 — SaaS Dashboard
 * 4 统计卡 / Revenue 双折线 / Status 圆环 / Recent Orders
 */
class Dashboard extends Backend
{
    protected $noNeedRight = ['stats', 'trend', 'recent', 'status', 'tracking'];

    public function _initialize()
    {
        parent::_initialize();
    }

    public function index()
    {
        return $this->view->fetch();
    }

    /**
     * 4 统计卡 + 迷你面积图 + 同比 %
     */
    public function stats()
    {
        $collectionModel       = model('app\admin\model\nft\Collection');
        $userCollectionModel   = model('app\admin\model\nft\UserCollection');
        $orderModel            = model('app\admin\model\nft\Order');

        // 本周时间窗
        $today = strtotime(date('Y-m-d'));
        $weekStart  = $today - 6 * 86400;
        $weekEnd    = $today + 86400;
        $lastWeekStart = $weekStart - 7 * 86400;
        $lastWeekEnd   = $weekStart;

        // —— 迷你面积图：7 天数据 ——
        $days = [];
        for ($i = 6; $i >= 0; $i--) {
            $days[] = $today - $i * 86400;
        }
        $mkTrend = function ($cb) use ($days) {
            $out = [];
            foreach ($days as $d) {
                $start = $d; $end = $d + 86400;
                $out[] = call_user_func($cb, $start, $end);
            }
            return $out;
        };

        $revenueTrend = $mkTrend(function ($s, $e) use ($orderModel) {
            return (float)$orderModel->where('createtime', 'between', [$s, $e])
                ->where('status', 'in', ['paid', 'completed'])->sum('pay_price');
        });
        $usersTrend = $mkTrend(function ($s, $e) {
            return (int)\app\admin\model\User::where('jointime', 'between', [$s, $e])->count();
        });
        $collectionsTrend = $mkTrend(function ($s, $e) use ($collectionModel) {
            return (int)$collectionModel->where('createtime', 'between', [$s, $e])->count();
        });
        $chainTrend = $mkTrend(function ($s, $e) use ($userCollectionModel) {
            return (int)$userCollectionModel->where('createtime', 'between', [$s, $e])->count();
        });

        // —— 同比 % ——
        $mkChange = function ($nowVal, $cbPrev) use ($weekStart, $weekEnd, $lastWeekStart, $lastWeekEnd) {
            $now = (float)$nowVal;
            $prev = (float)call_user_func($cbPrev, $lastWeekStart, $lastWeekEnd);
            if ($prev == 0) return $now > 0 ? 100 : 0;
            return round(($now - $prev) / $prev * 100, 1);
        };

        $data = [
            // 4 张卡主值
            'total_sales'           => (float)$orderModel->where('status', 'in', ['paid', 'completed'])->sum('pay_price'),
            'user_count'            => (int)\app\admin\model\User::where('status', 'normal')->count(),
            'on_sale_count'         => (int)$collectionModel->where('sale_status', 'on_sale')->count(),
            'total_user_collections'=> (int)$userCollectionModel->where('status', 'normal')->count(),

            // 迷你面积图（7 天）
            'revenue_trend'    => $revenueTrend,
            'users_trend'      => $usersTrend,
            'collections_trend'=> $collectionsTrend,
            'chain_trend'      => $chainTrend,

            // 同比 %（本周 vs 上周）
            'revenue_change' => $mkChange(
                $orderModel->where('createtime', 'between', [$weekStart, $weekEnd])->where('status', 'in', ['paid', 'completed'])->sum('pay_price'),
                function ($s, $e) use ($orderModel) { return $orderModel->where('createtime', 'between', [$s, $e])->where('status', 'in', ['paid', 'completed'])->sum('pay_price'); }
            ),
            'users_change' => $mkChange(
                \app\admin\model\User::where('jointime', 'between', [$weekStart, $weekEnd])->count(),
                function ($s, $e) { return \app\admin\model\User::where('jointime', 'between', [$s, $e])->count(); }
            ),
            'collections_change' => $mkChange(
                $collectionModel->where('createtime', 'between', [$weekStart, $weekEnd])->count(),
                function ($s, $e) use ($collectionModel) { return $collectionModel->where('createtime', 'between', [$s, $e])->count(); }
            ),
            'chain_change' => $mkChange(
                $userCollectionModel->where('createtime', 'between', [$weekStart, $weekEnd])->count(),
                function ($s, $e) use ($userCollectionModel) { return $userCollectionModel->where('createtime', 'between', [$s, $e])->count(); }
            ),
        ];

        $this->success('', null, $data);
    }

    /**
     * Revenue 双折线：Income / Outcome（7 天）
     */
    public function trend()
    {
        $orderModel = model('app\admin\model\nft\Order');
        $days = []; $income = []; $outcome = [];

        for ($i = 6; $i >= 0; $i--) {
            $start = strtotime(date('Y-m-d')) - $i * 86400;
            $end = $start + 86400;
            $days[] = date('m-d', $start);
            $income[] = (float)$orderModel->where('createtime', 'between', [$start, $end])
                ->where('status', 'in', ['paid', 'completed'])->sum('pay_price');
            // Outcome = 退款金额 + 取消订单金额
            $refund = (float)$orderModel->where('createtime', 'between', [$start, $end])
                ->where('status', 'in', ['refunding', 'refunded'])->sum('pay_price');
            $cancel = (float)$orderModel->where('createtime', 'between', [$start, $end])
                ->where('status', 'cancelled')->sum('pay_price');
            $outcome[] = round($refund + $cancel, 2);
        }

        $this->success('', null, [
            'days'     => $days,
            'income'   => $income,
            'outcome'  => $outcome,
            'refund_amount' => $outcome,
            'sales_amount'  => $income,
        ]);
    }

    /**
     * Status 圆环图：订单状态分布
     * received / booked / progress / canceled
     */
    public function status()
    {
        $orderModel = model('app\admin\model\nft\Order');
        $data = [
            'received'  => (int)$orderModel->where('status', 'completed')->count(),
            'booked'    => (int)$orderModel->where('status', 'pending')->count(),
            'progress'  => (int)$orderModel->where('status', 'in', ['paid', 'refunding'])->count(),
            'canceled'  => (int)$orderModel->where('status', 'in', ['cancelled', 'refunded'])->count(),
        ];
        $this->success('', null, $data);
    }

    /**
     * Recent Orders — 手动补关联避免 JOIN id 歧义
     */
    public function recent()
    {
        $orderModel = model('app\admin\model\nft\Order');
        $userModel = model('app\admin\model\User');
        $collectionModel = model('app\admin\model\nft\Collection');

        $orders = $orderModel->order('id desc')->limit(10)->select();
        $users = $userModel->where('id', 'in', array_unique(array_column($orders, 'user_id')))
            ->column('nickname', 'id');
        $collections = $collectionModel->where('id', 'in', array_unique(array_column($orders, 'collection_id')))
            ->column('name', 'id');

        $out = [];
        foreach ($orders as $o) {
            $out[] = [
                'id'            => $o->id,
                'order_no'      => $o->order_no,
                'user_id'       => $o->user_id,
                'user'          => ['nickname' => isset($users[$o->user_id]) ? $users[$o->user_id] : ''],
                'collection_id' => $o->collection_id,
                'collection'    => ['name' => isset($collections[$o->collection_id]) ? $collections[$o->collection_id] : ''],
                'pay_price'     => $o->pay_price,
                'total_price'   => $o->total_price,
                'status'        => $o->status,
                'createtime'    => $o->createtime,
            ];
        }

        $this->success('', null, ['orders' => $out]);
    }

    /**
     * Tracking — 按分类/系列聚合成交额（参考图右侧小面板）
     */
    public function tracking()
    {
        $orderModel = model('app\admin\model\nft\Order');
        $seriesModel = model('app\admin\model\nft\Series');
        $categoryModel = model('app\admin\model\nft\Category');

        // 按 series_id 聚合成交额
        $seriesAgg = $orderModel
            ->where('status', 'in', ['completed', 'paid', 'refunding'])
            ->field('series_id, SUM(pay_price) as amount, COUNT(*) as cnt')
            ->group('series_id')
            ->order('amount desc')
            ->limit(5)
            ->select();

        $seriesNames = $seriesModel->where('id', 'in', array_column($seriesAgg, 'series_id'))
            ->column('name', 'id');

        $out = [];
        foreach ($seriesAgg as $row) {
            $out[] = [
                'name'   => isset($seriesNames[$row['series_id']]) ? $seriesNames[$row['series_id']] : '系列 #' . $row['series_id'],
                'amount' => floatval($row['amount']),
                'count'  => intval($row['cnt']),
            ];
        }
        // 如果没有订单，兜底返回热门藏品
        if (!$out) {
            $colModel = model('app\admin\model\nft\Collection');
            $topCols = $colModel->where('sale_status', 'in', ['on_sale', 'sold_out'])
                ->where('status', 'normal')
                ->order('weigh desc, id desc')
                ->limit(5)
                ->select();
            foreach ($topCols as $c) {
                $out[] = [
                    'name'   => $c->name,
                    'amount' => 0,
                    'count'  => 0,
                ];
            }
        }

        $this->success('', null, ['items' => $out]);
    }
}
