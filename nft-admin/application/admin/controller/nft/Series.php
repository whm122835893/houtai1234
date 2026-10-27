<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 藏品系列
 *
 * @icon fa fa-cubes
 */
class Series extends Backend
{
    protected $model = null;
    protected $searchFields = 'name,description';
    protected $relationSearch = true;
    protected $noNeedRight = ['selectpage'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Series');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("isBoxList", $this->model->getIsBoxList());
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
                ->with(['category'])
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

    public function del($ids = "")
    {
        return parent::del($ids);
    }

    public function multi($ids = "")
    {
        return parent::multi($ids);
    }

    public function selectpage()
    {
        return parent::selectpage();
    }
}
