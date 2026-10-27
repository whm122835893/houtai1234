define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/kyc/index' + location.search,
                    table: 'nft_kyc',
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
                        {field: 'user.nickname', title: '用户昵称', operate: 'LIKE'},
                        {field: 'user.mobile', title: '手机号', operate: 'LIKE'},
                        {field: 'real_name', title: '真实姓名', operate: 'LIKE'},
                        {field: 'idcard_mask', title: '身份证号', operate: false},
                        {field: 'idcard_front', title: '证件照', operate: false, events: Table.api.events.image, formatter: Table.api.formatter.image},
                        {field: 'status', title: '状态', searchList: {pending: '待审核', approved: '已通过', rejected: '已拒绝'}, formatter: Table.api.formatter.label},
                        {field: 'reject_reason', title: '拒绝原因', operate: 'LIKE'},
                        {field: 'createtime', title: '提交时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'audit_time_text', title: '审核时间', operate: false},
                        {
                            field: 'operate', title: '审核', table: table,
                            buttons: [
                                {
                                    name: 'audit',
                                    text: '审核',
                                    icon: 'fa fa-check-circle',
                                    classname: 'btn btn-xs btn-info btn-dialog',
                                    icon: 'fa fa-pencil',
                                    url: 'nft/kyc/audit',
                                    visible: function (row) {
                                        return row.status == 'pending';
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
        audit: function () {
            Form.api.bindevent($("form[role=form]"));
        },
        api: {
            bindevent: function () {
                Form.api.bindevent($("form[role=form]"));
            }
        }
    };
    return Controller;
});
