<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 优先购白名单
 *
 * @icon fa fa-check-square-o
 */
class Whitelist extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'user.nickname,user.mobile';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Whitelist');
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
}
