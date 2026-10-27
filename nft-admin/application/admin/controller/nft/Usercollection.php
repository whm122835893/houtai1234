<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use app\admin\model\User as UserModel;

/**
 * 用户藏品
 *
 * @icon fa fa-user-circle-o
 */
class Usercollection extends Backend
{
    protected $model = null;
    protected $searchFields = 'id,token_id';
    protected $relationSearch = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\UserCollection');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("sourceList", $this->model->getSourceList());
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

    public function del($ids = "")
    {
        return parent::del($ids);
    }

    /**
     * 转移
     */
    public function transfer($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $target_user_id = $this->request->post('target_user_id');
        if (!$target_user_id) {
            $this->error('请输入目标用户ID');
        }
        $target = UserModel::get($target_user_id);
        if (!$target) {
            $this->error('目标用户不存在');
        }
        $list = $this->model->where('id', 'in', $ids)->where('status', 'normal')->select();
        $count = 0;
        foreach ($list as $row) {
            if ($row['user_id'] == $target_user_id) {
                continue;
            }
            $row->user_id = $target_user_id;
            $row->source = 'transfer';
            $row->status = 'normal';
            $row->save();
            $count++;
        }
        $this->success("成功转移 {$count} 个藏品");
    }

    /**
     * 销毁
     */
    public function burn($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $list = $this->model->where('id', 'in', $ids)->where('status', 'normal')->select();
        $count = 0;
        foreach ($list as $row) {
            $row->status = 'burned';
            $row->save();
            $count++;
        }
        $this->success("成功销毁 {$count} 个藏品");
    }
}
