define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/transfer/index' + location.search,
                    table: 'nft_transfer',
                }
            });

            var table = $("#table");
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'id',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: 'ID'},
                        {field: 'sn', title: '转赠单号', operate: 'LIKE'},
                        {field: 'fromuser.nickname', title: '转赠人', operate: 'LIKE'},
                        {field: 'touser.nickname', title: '受赠人', operate: 'LIKE'},
                        {field: 'usercollection.id', title: '用户藏品ID', operate: false},
                        {field: 'chain_tx_hash', title: '链上哈希', operate: 'LIKE', formatter: Table.api.formatter.search},
                        {field: 'status', title: '状态', searchList: {pending: '待处理', success: '转赠成功', rejected: '已拒绝', cancelled: '已取消'}, formatter: Table.api.formatter.label},
                        {field: 'remark', title: '备注', operate: 'LIKE'},
                        {field: 'createtime', title: '申请时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {
                            field: 'operate', title: '审核', table: table,
                            buttons: [
                                {
                                    name: 'approve',
                                    text: '通过',
                                    classname: 'btn btn-xs btn-success btn-ajax',
                                    icon: 'fa fa-check',
                                    url: 'nft/transfer/approve',
                                    confirm: '确认通过该转赠申请？通过后藏品持有人将立即变更为受赠人，操作不可撤销！',
                                    visible: function (row) {
                                        return row.status == 'pending';
                                    },
                                    success: function (data, ret) {
                                        table.bootstrapTable('refresh');
                                    }
                                },
                                {
                                    name: 'reject',
                                    text: '拒绝',
                                    classname: 'btn btn-xs btn-danger btn-ajax',
                                    icon: 'fa fa-times',
                                    url: 'nft/transfer/reject',
                                    confirm: '确认拒绝该转赠申请？',
                                    visible: function (row) {
                                        return row.status == 'pending';
                                    },
                                    success: function (data, ret) {
                                        table.bootstrapTable('refresh');
                                    }
                                }
                            ],
                            events: Table.api.events.operate,
                            formatter: Table.api.formatter.buttons
                        }
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
