<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use think\Config;

/**
 * 签到管理
 *
 * @icon fa fa-calendar-check-o
 */
class Sign extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'user.nickname,user.mobile';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\SignLog');
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

        // 今日签到数 / 累计签到数
        $todayStart = strtotime(date('Y-m-d'));
        $this->view->assign('today_count', $this->model->where('createtime', '>=', $todayStart)->count());
        $this->view->assign('total_count', $this->model->count());
        $this->view->assign('total_score', $this->model->sum('score'));
        return $this->view->fetch();
    }

    /**
     * 签到奖励配置
     */
    public function config()
    {
        if ($this->request->isPost()) {
            $values = [
                'enabled'     => $this->request->post('enabled') ? true : false,
                'base_score'  => max(0, (int)$this->request->post('base_score', 5)),
                'day7_bonus'  => max(0, (int)$this->request->post('day7_bonus', 20)),
                'day30_bonus' => max(0, (int)$this->request->post('day30_bonus', 100)),
            ];
            $this->saveConfig('sign', $values);
            $this->success('签到配置保存成功');
        }
        $config = Config::get('nft.sign');
        $this->view->assign('config', $config ?: []);
        return $this->view->fetch();
    }

    /**
     * 保存配置到 extra/nft.php
     */
    private function saveConfig($key, $values)
    {
        $config = Config::get('nft');
        if (!is_array($config)) {
            $config = [];
        }
        $config[$key] = isset($config[$key]) && is_array($config[$key])
            ? array_merge($config[$key], $values)
            : $values;
        $content = "<?php\n\n/**\n * 数字藏品配置文件\n */\nreturn " . var_export($config, true) . ";\n";
        file_put_contents(APP_PATH . 'extra' . DS . 'nft.php', $content);
    }
}
