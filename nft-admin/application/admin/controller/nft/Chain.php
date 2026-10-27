<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use app\common\service\ChainService;

/**
 * 链上记录
 *
 * @icon fa fa-link
 */
class Chain extends Backend
{
    protected $model = null;
    protected $searchFields = 'id,tx_hash';
    protected $relationSearch = false;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\ChainLog');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("typeList", $this->model->getTypeList());
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
     * 重试上链
     */
    public function retry($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $row = $this->model->where('id', $ids)->where('status', 'fail')->find();
        if (!$row) {
            $this->error('记录不存在或状态不可重试');
        }
        try {
            $chain = ChainService::getInstance();
            $result = $chain->mint([
                'collection_id' => $row['collection_id'],
                'contract_address' => $row['contract_address'],
                'to_address' => $row['to_address'],
                'token_id' => $row['token_id'],
            ]);
            $row->tx_hash = $result['tx_hash'];
            $row->block_number = $result['block_number'];
            $row->status = 'success';
            $row->chain_response = $result;
            $row->save();
            $this->success('重试成功', null, $result);
        } catch (\Exception $e) {
            $row->status = 'fail';
            $row->remark = $e->getMessage();
            $row->save();
            $this->error('重试失败：' . $e->getMessage());
        }
    }
}
