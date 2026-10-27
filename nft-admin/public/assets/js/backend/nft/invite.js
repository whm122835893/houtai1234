define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/invite/index' + location.search,
                    table: 'nft_invite_log',
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
                        {field: 'user.nickname', title: '邀请人', operate: 'LIKE'},
                        {field: 'user.mobile', title: '邀请人手机', operate: 'LIKE'},
                        {field: 'invitee.nickname', title: '被邀请人', operate: 'LIKE'},
                        {field: 'score', title: '奖励积分', operate: false, formatter: function (value) { return '<strong style="color:#f5a623;">+' + value + '</strong>'; }},
                        {field: 'status', title: '状态', searchList: {normal: '有效', invalid: '无效'}, formatter: Table.api.formatter.label},
                        {field: 'createtime', title: '邀请时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime}
                    ]
                ]
            });

            Table.api.bindevent(table);
        },
        config: function () {
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
