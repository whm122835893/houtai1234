define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/rights/index' + location.search,
                    add_url: 'nft/rights/add',
                    edit_url: 'nft/rights/edit',
                    del_url: 'nft/rights/del',
                    multi_url: 'nft/rights/multi',
                    table: 'nft_rights',
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
                        {field: 'title', title: '权益名称', align: 'left', operate: 'LIKE'},
                        {field: 'type', title: '类型', searchList: {physical: '实物兑换', coupon: '优惠券', offline: '线下权益', virtual: '虚拟权益'}, formatter: Table.api.formatter.label},
                        {field: 'collection_id', title: '关联藏品', operate: false, formatter: function (value, row) { return value == 0 ? '通用' : (row.collection && row.collection.name ? row.collection.name : value); }},
                        {field: 'image', title: '图片', operate: false, events: Table.api.events.image, formatter: Table.api.formatter.image},
                        {field: 'stock', title: '库存', operate: false},
                        {field: 'status', title: '状态', searchList: {normal: '正常', hidden: '隐藏'}, formatter: Table.api.formatter.status},
                        {field: 'createtime', title: '创建时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        log: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/rights/log' + location.search,
                    table: 'nft_rights_log',
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
                        {field: 'rights.title', title: '权益名称', operate: 'LIKE'},
                        {field: 'user.nickname', title: '用户', operate: 'LIKE'},
                        {field: 'code', title: '核销码', operate: 'LIKE'},
                        {field: 'status', title: '状态', searchList: {unused: '未核销', used: '已核销', expired: '已过期'}, formatter: Table.api.formatter.label},
                        {field: 'usetime_text', title: '核销时间', operate: false},
                        {field: 'createtime', title: '领取时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime}
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        add: function () {
            Controller.api.bindevent();
        },
        edit: function () {
            Controller.api.bindevent();
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
