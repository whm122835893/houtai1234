define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/order/index' + location.search,
                    refund_url: 'nft/order/refund',
                    complete_url: 'nft/order/complete',
                    cancel_url: 'nft/order/cancel',
                    table: 'nft_order',
                }
            });

            var table = $("#table");

            $('.btn-refund').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Layer.confirm('确定要退款吗？', function (index) {
                    Fast.api.ajax({url: Config.moduleurl + '/nft/order/refund', data: {ids: ids}}, function () {
                        table.bootstrapTable('refresh');
                        Layer.close(index);
                    });
                });
            });

            $('.btn-complete').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Fast.api.ajax({url: Config.moduleurl + '/nft/order/complete', data: {ids: ids}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            $('.btn-cancel').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Fast.api.ajax({url: Config.moduleurl + '/nft/order/cancel', data: {ids: ids}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                sortOrder: 'desc',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'order_no', title: __('Order_no'), operate: 'LIKE'},
                        {field: 'user.nickname', title: __('Nickname'), operate: 'LIKE'},
                        {field: 'collection.name', title: __('Collection_id'), operate: 'LIKE'},
                        {field: 'quantity', title: __('Quantity'), operate: false},
                        {field: 'total_price', title: __('Total_price'), operate: false},
                        {field: 'pay_type', title: __('Pay_type'), searchList: {balance: '余额', alipay: '支付宝', wechat: '微信', chain: '链上支付'}, formatter: Table.api.formatter.label},
                        {field: 'pay_status', title: __('Pay_status'), searchList: {unpaid: '未支付', paid: '已支付', refunded: '已退款'}, formatter: Table.api.formatter.status},
                        {field: 'chain_tx_hash', title: __('Chain_tx_hash'), operate: 'LIKE'},
                        {field: 'status', title: __('Status'), searchList: {pending: '待支付', paid: '已支付', cancelled: '已取消', refunding: '退款中', refunded: '已退款', completed: '已完成'}, formatter: Table.api.formatter.status},
                        {field: 'pay_time', title: __('Pay_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'createtime', title: __('Createtime'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
