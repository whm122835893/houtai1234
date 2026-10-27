<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 藏品权益管理
 *
 * @icon fa fa-trophy
 */
class Rights extends Backend
{
    protected $model = null;
    protected $relationSearch = false;
    protected $searchFields = 'id,title';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Rights');
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

    /**
     * 核销记录
     */
    public function log()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $logModel = model('app\admin\model\nft\RightsLog');
            $list = $logModel
                ->with(['rights', 'user'])
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
