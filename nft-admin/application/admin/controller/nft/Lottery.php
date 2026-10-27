<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use think\Db;

/**
 * 抽签申购
 *
 * @icon fa fa-ticket
 */
class Lottery extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'lottery.title,collection.name';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Lottery');
        $this->view->assign("statusList", $this->model->getStatusList());
    }

    public function index()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            if ($this->request->request('keyField')) {
                return $this->selectpage();
            }
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->with(['collection'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();
            $result = ["total" => $this->model->where($where)->count(), "rows" => $list];
            return json($result);
        }
        return $this->view->fetch();
    }

    public function add()
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::add();
    }

    public function edit($ids = null)
    {
        if ($this->request->isPost()) {
            $this->token();
        }
        return parent::edit($ids);
    }

    /**
     * 开奖：随机抽取中签用户
     */
    public function draw($ids = "")
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($row->status == 'drawing' || $row->status == 'finished') {
            $this->error('该活动已开奖');
        }

        $logModel = model('app\admin\model\nft\LotteryLog');
        $logs = $logModel->where('lottery_id', $row->id)->where('status', 'pending')->select();
        if (!$logs) {
            $this->error('暂无有效申购记录');
        }

        $winNumber = (int)$row->win_number;
        if ($winNumber <= 0) {
            $this->error('请先设置中签份数');
        }

        Db::startTrans();
        try {
            $logIds = array_column(collection($logs)->toArray(), 'id');
            shuffle($logIds);
            $winIds = array_slice($logIds, 0, min($winNumber, count($logIds)));

            foreach ($logIds as $logId) {
                $isWin = in_array($logId, $winIds) ? 1 : 0;
                $logModel->where('id', $logId)->update([
                    'is_win'     => $isWin,
                    'status'     => $isWin ? 'win' : 'missed',
                    'updatetime' => time(),
                ]);
            }

            $row->status    = 'drawing';
            $row->open_time = time();
            $row->save();

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error('开奖失败：' . $e->getMessage());
        }

        $this->success("开奖成功，共中签 " . count($winIds) . " 名");
    }

    /**
     * 申购记录
     */
    public function log()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $logModel = model('app\admin\model\nft\LotteryLog');
            $list = $logModel
                ->with(['lottery', 'user'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();
            $result = ["total" => $logModel->where($where)->count(), "rows" => $list];
            return json($result);
        }
        return $this->view->fetch();
    }
}
