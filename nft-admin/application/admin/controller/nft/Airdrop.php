<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;

/**
 * 空投活动
 *
 * @icon fa fa-gift
 */
class Airdrop extends Backend
{
    protected $model = null;
    protected $searchFields = 'title';
    protected $relationSearch = true;

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Airdrop');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("conditionTypeList", $this->model->getConditionTypeList());
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
                ->with(['collection'])
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

    public function selectpage()
    {
        return parent::selectpage();
    }

    /**
     * 执行空投(事务)
     */
    public function execute($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $airdrop = $this->model->get($ids);
        if (!$airdrop) {
            $this->error('空投活动不存在');
        }
        if ($airdrop->sent_count >= $airdrop->total_count) {
            $this->error('空投已发完');
        }

        // 根据条件获取用户
        $userModel = \app\admin\model\User::class;
        $userQuery = $userModel::where('status', 'normal');
        switch ($airdrop['condition_type']) {
            case 'all':
                break;
            case 'new_user':
                $userQuery->where('createtime', '>', time() - 86400 * 7);
                break;
            case 'vip':
                $userQuery->where('group_id', '>', 1);
                break;
            case 'specified':
                $idsArr = array_filter(array_map('intval', explode(',', $airdrop['condition_value'])));
                if ($idsArr) {
                    $userQuery->where('id', 'in', $idsArr);
                }
                break;
        }
        $remaining = $airdrop->total_count - $airdrop->sent_count;
        $users = $userQuery->limit($remaining)->select();
        if (!$users || count($users) == 0) {
            $this->error('没有符合条件的用户');
        }

        \think\Db::startTrans();
        try {
            $count = 0;
            foreach ($users as $user) {
                \app\admin\model\nft\UserCollection::create([
                    'user_id' => $user['id'],
                    'collection_id' => $airdrop['collection_id'],
                    'source' => 'airdrop',
                    'source_id' => $airdrop['id'],
                    'quantity' => 1,
                    'status' => 'normal',
                ]);
                \app\admin\model\nft\AirdropLog::create([
                    'airdrop_id' => $airdrop['id'],
                    'user_id' => $user['id'],
                    'username' => $user['nickname'] ?: $user['username'],
                    'quantity' => 1,
                    'status' => 'success',
                ]);
                $count++;
            }
            $airdrop->sent_count += $count;
            $airdrop->save();
            \think\Db::commit();
        } catch (\Exception $e) {
            \think\Db::rollback();
            $this->error('空投失败：' . $e->getMessage());
        }
        $this->success("成功空投 {$count} 个");
    }

    /**
     * 空投记录
     */
    public function log($ids = "")
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            if ($ids) {
                $where['airdrop_id'] = $ids;
            }
            $logModel = model('app\admin\model\nft\AirdropLog');
            $list = $logModel
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
