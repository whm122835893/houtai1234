define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/series/index' + location.search,
                    add_url: 'nft/series/add',
                    edit_url: 'nft/series/edit',
                    del_url: 'nft/series/del',
                    multi_url: 'nft/series/multi',
                    table: 'nft_series',
                }
            });

            var table = $("#table");
            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'weigh',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'category.name', title: __('Category_id'), operate: 'LIKE'},
                        {field: 'name', title: __('Name'), align: 'left'},
                        {field: 'cover', title: __('Cover'), operate: false, events: Table.api.events.image, formatter: Table.api.formatter.image},
                        {field: 'is_box', title: __('Is_box'), searchList: {'0': '否', '1': '是'}, formatter: Table.api.formatter.toggle},
                        {field: 'box_price', title: __('Box_price'), operate: false},
                        {field: 'total_supply', title: __('Total_supply'), operate: false},
                        {field: 'sold_count', title: __('Sold_count'), operate: false},
                        {field: 'start_time', title: __('Start_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'end_time', title: __('End_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'weigh', title: __('Weigh'), operate: false},
                        {field: 'status', title: __('Status'), searchList: {normal: '正常', hidden: '隐藏'}, formatter: Table.api.formatter.status},
                        {field: 'operate', title: __('Operate'), table: table, events: Table.api.events.operate, formatter: Table.api.formatter.operate}
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
