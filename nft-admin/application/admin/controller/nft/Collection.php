<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use app\common\service\ChainService;

/**
 * 藏品管理
 *
 * @icon fa fa-gem
 */
class Collection extends Backend
{
    protected $model = null;
    protected $searchFields = 'id,name,creator';
    protected $relationSearch = true;
    protected $noNeedRight = ['selectpage'];

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\Collection');
        $this->view->assign("statusList", $this->model->getStatusList());
        $this->view->assign("saleStatusList", $this->model->getSaleStatusList());
        $this->view->assign("isRecommendList", $this->model->getIsRecommendList());
        $this->view->assign("consignOpenList", $this->model->getConsignOpenList());
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
                ->with(['category', 'series'])
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

    /**
     * 发售
     */
    public function onsale($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $list = $this->model->where('id', 'in', $ids)->select();
        foreach ($list as $row) {
            if ($row['sale_status'] != 'not_started') {
                continue;
            }
            $row->sale_status = 'on_sale';
            $row->start_time = time();
            $row->save();
        }
        $this->success('已设置为发售中');
    }

    /**
     * 下架
     */
    public function offline($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $list = $this->model->where('id', 'in', $ids)->select();
        foreach ($list as $row) {
            $row->sale_status = 'ended';
            $row->end_time = time();
            $row->save();
        }
        $this->success('已下架');
    }

    /**
     * 铸造(上链)
     */
    public function mint($ids = "")
    {
        if (!$ids) {
            $this->error('参数不能为空');
        }
        $row = $this->model->get($ids);
        if (!$row) {
            $this->error('藏品不存在');
        }
        if ($row->token_id) {
            $this->error('该藏品已经铸造过');
        }
        try {
            $chain = ChainService::getInstance();
            $result = $chain->mint([
                'collection_id' => $row['id'],
                'contract_address' => $row['chain_address'] ?: config('nft.chain.contract_address'),
                'to_address' => $row['creator_address'] ?: config('nft.chain.contract_address'),
            ]);
            // 记录链上日志
            \app\admin\model\nft\ChainLog::create([
                'type' => 'mint',
                'collection_id' => $row['id'],
                'token_id' => $result['token_id'],
                'contract_address' => $row['chain_address'] ?: config('nft.chain.contract_address'),
                'from_address' => config('nft.chain.contract_address'),
                'to_address' => $row['creator_address'] ?: config('nft.chain.contract_address'),
                'tx_hash' => $result['tx_hash'],
                'block_number' => $result['block_number'],
                'status' => 'success',
                'chain_response' => $result,
            ]);
            $row->token_id = $result['token_id'];
            $row->chain_address = $row['chain_address'] ?: config('nft.chain.contract_address');
            $row->minted_count = 1;
            $row->save();
            $this->success('铸造成功', null, $result);
        } catch (\Exception $e) {
            $this->error('铸造失败：' . $e->getMessage());
        }
    }
}
