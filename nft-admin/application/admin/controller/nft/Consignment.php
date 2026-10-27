<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 寄售市场
 *
 * @icon fa fa-tags
 */
class Consignment extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'consignment.sn,user.nickname,collection.name';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Consignment');
        $this->view->assign("statusList", $this->model->getStatusList());
    }

    public function index()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
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

    /**
     * 审核通过（上架寄售）
     */
    public function audit($ids = "")
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($row->status != 'pending') {
            $this->error('仅待审核的寄售单可以审核');
        }

        // 单品寄售开关校验
        $collection = model('app\admin\model\nft\Collection')->get($row->collection_id);
        if (!$collection) {
            $this->error('关联藏品不存在');
        }
        if (empty($collection['consign_open'])) {
            $this->error('该藏品未开启寄售功能，请先在藏品管理中开启「允许寄售」');
        }

        // 单品限价校验（0 表示不限制）
        $price      = floatval($row->price);
        $priceMin   = floatval($collection['consign_price_min']);
        $priceMax   = floatval($collection['consign_price_max']);
        if ($price <= 0) {
            $this->error('寄售价格必须大于 0');
        }
        if ($priceMin > 0 && $price < $priceMin) {
            $this->error(sprintf('寄售价格 %.2f 低于该藏品限价下限 %.2f，请驳回或让卖家改价', $price, $priceMin));
        }
        if ($priceMax > 0 && $price > $priceMax) {
            $this->error(sprintf('寄售价格 %.2f 高于该藏品限价上限 %.2f，请驳回或让卖家改价', $price, $priceMax));
        }

        $row->status     = 'onsale';
        $row->audit_time = time();
        $row->save();
        $this->success();
    }

    /**
     * 下架
     */
    public function offline($ids = "")
    {
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($row->status != 'onsale') {
            $this->error('仅寄售中的记录可以下架');
        }
        $row->status = 'offline';
        $row->save();
        $this->success();
    }
}
