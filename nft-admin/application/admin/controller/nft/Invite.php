<?php

namespace app\admin\controller\nft;

use app\common\controller\Backend;
use think\Config;
use think\Db;

/**
 * 邀请管理
 *
 * @icon fa fa-share-alt
 */
class Invite extends Backend
{
    protected $model = null;
    protected $relationSearch = true;
    protected $searchFields = 'user.nickname,user.mobile,invitee.nickname';

    public function _initialize()
    {
        parent::_initialize();
        $this->model = model('app\admin\model\nft\InviteLog');
    }

    public function index()
    {
        $this->request->filter(['strip_tags', 'trim']);
        if ($this->request->isAjax()) {
            list($where, $sort, $order, $offset, $limit) = $this->buildparams();
            $list = $this->model
                ->with(['user', 'invitee'])
                ->where($where)
                ->order($sort, $order)
                ->limit($offset, $limit)
                ->select();
            $result = ["total" => $this->model->where($where)->count(), "rows" => $list];
            return json($result);
        }

        // 汇总统计
        $this->view->assign('total_invite', $this->model->where('status', 'normal')->count());
        $this->view->assign('total_score', $this->model->where('status', 'normal')->sum('score'));
        $this->view->assign('inviter_count', Db::name('nft_invite_log')->where('status', 'normal')->group('user_id')->count());
        return $this->view->fetch();
    }

    /**
     * 邀请排行榜 TOP50
     */
    public function ranking()
    {
        $list = Db::name('nft_invite_log')
            ->alias('l')
            ->join('user u', 'u.id = l.user_id', 'LEFT')
            ->field('l.user_id, u.nickname, u.mobile, u.avatar, COUNT(*) AS invite_count, IFNULL(SUM(l.score), 0) AS total_score')
            ->where('l.status', 'normal')
            ->group('l.user_id')
            ->order('invite_count DESC, total_score DESC')
            ->limit(50)
            ->select();
        $this->view->assign('list', $list);
        return $this->view->fetch();
    }

    /**
     * 邀请奖励配置
     */
    public function config()
    {
        if ($this->request->isPost()) {
            $values = [
                'enabled'       => $this->request->post('enabled') ? true : false,
                'inviter_score' => max(0, (int)$this->request->post('inviter_score', 100)),
                'invitee_score' => max(0, (int)$this->request->post('invitee_score', 20)),
            ];
            $this->saveConfig('invite', $values);
            $this->success('邀请配置保存成功');
        }
        $config = Config::get('nft.invite');
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
