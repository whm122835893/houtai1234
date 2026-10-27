<?php

namespace app\common\service;

/**
 * 链服务入口类
 */
class ChainService
{
    /**
     * @var self
     */
    private static $instance = null;

    /**
     * @var \app\common\service\chain\BaseDriver
     */
    private $driver = null;

    /**
     * @var array
     */
    private $config = [];

    private function __construct()
    {
        $this->config = config('nft.chain');
        $driverClass = '\\app\\common\\service\\chain\\' . ucfirst($this->config['driver']) . 'Driver';
        if (!class_exists($driverClass)) {
            throw new \Exception("链驱动 [{$driverClass}] 不存在");
        }
        $this->driver = new $driverClass($this->config);
    }

    /**
     * 获取单例实例
     * @return self
     */
    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * 获取驱动实例
     * @return \app\common\service\chain\BaseDriver
     */
    public function getDriver()
    {
        return $this->driver;
    }

    /**
     * 铸造 NFT
     * @param array $params
     * @return array ['tx_hash','token_id','block_number','status']
     */
    public function mint($params = [])
    {
        return $this->driver->mint($params);
    }

    /**
     * 转移 NFT
     * @param array $params
     * @return array
     */
    public function transfer($params = [])
    {
        return $this->driver->transfer($params);
    }

    /**
     * 空投
     * @param array $params
     * @return array
     */
    public function airdrop($params = [])
    {
        return $this->driver->airdrop($params);
    }

    /**
     * 销毁
     * @param array $params
     * @return array
     */
    public function burn($params = [])
    {
        return $this->driver->burn($params);
    }

    /**
     * 查询交易状态
     * @param string $txHash
     * @return array
     */
    public function getTxStatus($txHash)
    {
        return $this->driver->getTxStatus($txHash);
    }
}
