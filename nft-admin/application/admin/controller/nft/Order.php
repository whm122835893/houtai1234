<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 订单管理
 *
 * @icon fa fa-shopping-cart
 */
class Order extends Backend
{
    protected $model = null;
    protected $searchFields = 'id,order_no';
    protected $relationSearch = true;
    protected $noNeedRight = ['selectpage'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Order');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("payStatusList", $this->model->getPayStatusList());
        $this->view->assign("payTypeList", $this->model->getPayTypeList());
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
                ->with(['user', 'collection'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();

            $result = ["total" => $this->model->where($where)->count(), "rows" => $list];
            return json($result);
        }
        return $this->view->fetch();
    }

    public function selectpage()
    {
        return parent::selectpage();
    }

    /**
     * 订单详情
     */
    public function detail($ids = null)
    {
        $row = $this->model->with(['user', 'collection'])->find($ids);
        if (!$row) {
            $this->error('订单不存在');
        }
        $this->success('', null, $row);
    }

    /**
     * 退款(事务)
     */
    public function refund($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $list = $this->model->where('id', 'in', $ids)->where('status', 'in', ['paid', 'completed'])->select();
        $count = 0;
        \think\Db::startTrans();
        try {
            foreach ($list as $row) {
                $row->status = 'refunded';
                $row->pay_status = 'refunded';
                $row->updatetime = time();
                $row->save();
                // 库存回滚
                if ($row->collection_id) {
                    $collection = \app\admin\model\nft\Collection::get($row->collection_id);
                    if ($collection) {
                        $collection->stock += $row->quantity;
                        $collection->sold_count = max(0, $collection->sold_count - $row->quantity);
                        $collection->save();
                    }
                }
                $count++;
            }
            \think\Db::commit();
        } catch (\Exception $e) {
            \think\Db::rollback();
            $this->error('退款失败：' . $e->getMessage());
        }
        $this->success("成功退款 {$count} 笔订单");
    }

    /**
     * 完成
     */
    public function complete($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $list = $this->model->where('id', 'in', $ids)->where('status', 'paid')->select();
        foreach ($list as $row) {
            $row->status = 'completed';
            $row->save();
        }
        $this->success('已完成');
    }

    /**
     * 取消
     */
    public function cancel($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $list = $this->model->where('id', 'in', $ids)->where('status', 'pending')->select();
        foreach ($list as $row) {
            $row->status = 'cancelled';
            $row->save();
            // 库存回滚
            if ($row->collection_id) {
                $collection = \app\admin\model\nft\Collection::get($row->collection_id);
                if ($collection && $row->quantity > 0) {
                    $collection->stock += $row->quantity;
                    $collection->save();
                }
            }
        }
        $this->success('已取消');
    }
}
