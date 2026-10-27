<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use think\Config;
use think\Db;

/**
 * 转赠管理
 *
 * @icon fa fa-exchange
 */
class Transfer extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'transfer.sn,fromuser.nickname,touser.nickname';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Transfer');
        $this->view->assign("statusList", $this->model->getStatusList());
    }

    public function index()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->with(['fromuser', 'touser', 'usercollection'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();
            $result = ["total" => $this->model->where($where)->count(), "rows" => $list];
            return json($result);
        }
        return $this->view->fetch();
    }

    /**
     * 审核通过并执行转赠（变更藏品持有人）
     */
    public function approve($ids = "")
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($row->status != 'pending') {
            $this->error('仅待处理的转赠可以审核');
        }

        $ucModel = model('app\admin\model\nft\UserCollection');
        $uc = $ucModel->get($row->user_collection_id);
        if (!$uc) {
            $this->error('用户藏品不存在，无法执行转赠');
        }
        if ($uc['is_locked']) {
            $this->error('该藏品已被锁定，无法转赠');
        }

        // 持有天数校验（0 = 不限制）
        $holdDays = (int)Config::get('nft.platform.transfer_hold_days');
        if ($holdDays > 0 && $uc['createtime'] > 0) {
            $held = floor((time() - $uc['createtime']) / 86400);
            if ($held < $holdDays) {
                $this->error("该藏品仅持有 {$held} 天，需持有满 {$holdDays} 天方可转赠（可在平台配置中调整）");
            }
        }

        Db::startTrans();
        try {
            // 变更持有人
            $ucModel->where('id', $uc['id'])->update([
                'user_id'    => $row->to_user_id,
                'source'     => 'transfer',
                'updatetime' => time(),
            ]);

            // 模拟链上转移哈希
            $hash = '0x' . bin2hex(random_bytes(32));

            $row->status        = 'success';
            $row->chain_tx_hash = $hash;
            $row->save();

            Db::commit();
        } catch (\Exception $e) {
            Db::rollback();
            $this->error('转赠执行失败：' . $e->getMessage());
        }

        $this->success('转赠执行成功，藏品已变更持有人');
    }

    /**
     * 拒绝转赠
     */
    public function reject($ids = "")
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($row->status != 'pending') {
            $this->error('仅待处理的转赠可以拒绝');
        }
        $row->status = 'rejected';
        $row->save();
        $this->success('已拒绝该转赠申请');
    }
}
