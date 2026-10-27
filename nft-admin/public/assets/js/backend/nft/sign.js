define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/sign/index' + location.search,
                    table: 'nft_sign_log',
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
                        {field: 'days', title: '连续天数', operate: false, formatter: function (value) { return '<strong style="color:#667eea;">' + value + '</strong> 天'; }},
                        {field: 'score', title: '奖励积分', operate: false, formatter: function (value) { return '<strong style="color:#f5a623;">+' + value + '</strong>'; }},
                        {field: 'createtime', title: '签到时间', operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime}
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
