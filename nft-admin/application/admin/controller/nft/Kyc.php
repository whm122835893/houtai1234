<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 实名认证管理
 *
 * @icon fa fa-id-card
 */
class Kyc extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'user.nickname,user.mobile,kyc.real_name';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Kyc');
        $this->view->assign("statusList", $this->model->getStatusList());
    }

    public function index()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->with(['user'])
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
     * 审核（弹窗）
     */
    public function audit($ids = null)
    {
        $row = $this->model->with(['user'])->find($ids);
        if (!$row) {
            $this->error(__('No Results were found'));
        }
        if ($this->request->isPost()) {
            $status = $this->request->post('status', 'approved');
            $reason = $this->request->post('reject_reason', '');
            if (!in_array($status, ['approved', 'rejected'])) {
                $this->error('参数错误');
            }
            if ($status == 'rejected' && $reason == '') {
                $this->error('请填写拒绝原因');
            }
            $row->status        = $status;
            $row->reject_reason = $status == 'rejected' ? $reason : '';
            $row->audit_time    = time();
            $row->save();
            $this->success();
        }
        $this->view->assign('row', $row);
        $this->view->assign('statusList', $this->model->getStatusList());
        return $this->view->fetch();
    }
}
