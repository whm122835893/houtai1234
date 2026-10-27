define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/consignment/index' + location.search,
                    table: 'nft_consignment',
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
                        {field: 'sn', title: '寄售单号', operate: 'LIKE'},
                        {field: 'user.nickname', title: '寄售人', operate: 'LIKE'},
                        {field: 'collection.name', title: '藏品名称', operate: 'LIKE'},
                        {field: 'price', title: '寄售价', operate: 'BETWEEN', formatter: function (value) { return '¥' + parseFloat(value).toFixed(2); }},
                        {field: 'status', title: '状态', searchList: {pending: '待审核', onsale: '寄售中', sold: '已售出', offline: '已下架', cancelled: '已取消'}, formatter: Table.api.formatter.label},
                        {field: 'audit_time_text', title: '审核时间', operate: false},
                        {field: 'sale_time_text', title: '售出时间', operate: false},
                        {field: 'createtime', title: '申请时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {
                            field: 'operate', title: '操作', table: table,
                            buttons: [
                                {
                                    name: 'audit',
                                    text: '通过上架',
                                    classname: 'btn btn-xs btn-success btn-ajax',
                                    icon: 'fa fa-check',
                                    url: 'nft/consignment/audit',
                                    confirm: '确认通过该寄售申请并上架？',
                                    visible: function (row) {
                                        return row.status == 'pending';
                                    },
                                    success: function (data, ret) {
                                        table.bootstrapTable('refresh');
                                    }
                                },
                                {
                                    name: 'offline',
                                    text: '下架',
                                    classname: 'btn btn-xs btn-danger btn-ajax',
                                    icon: 'fa fa-arrow-down',
                                    url: 'nft/consignment/offline',
                                    confirm: '确认下架该寄售记录？',
                                    visible: function (row) {
                                        return row.status == 'onsale';
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
