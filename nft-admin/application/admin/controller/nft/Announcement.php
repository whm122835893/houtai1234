<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 公告管理
 *
 * @icon fa fa-bullhorn
 */
class Announcement extends Backend
{
    protected $model = null;
    protected $searchFields = 'title';
    protected $relationSearch = false;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Announcement');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("typeList", $this->model->getTypeList());
        $this->view->assign("isTopList", $this->model->getIsTopList());
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
