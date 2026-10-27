define(['jquery', 'bootstrap', 'backend', 'table', 'form'], function ($, undefined, Backend, Table, Form) {

    var Controller = {
        index: function () {
            Table.api.init({
                extend: {
                    index_url: 'nft/collection/index' + location.search,
                    add_url: 'nft/collection/add',
                    edit_url: 'nft/collection/edit',
                    del_url: 'nft/collection/del',
                    multi_url: 'nft/collection/multi',
                    onsale_url: 'nft/collection/onsale',
                    offline_url: 'nft/collection/offline',
                    mint_url: 'nft/collection/mint',
                    table: 'nft_collection',
                }
            });

            var table = $("#table");

            // 发售
            $('.btn-onsale').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Fast.api.ajax({url: Config.moduleurl + '/nft/collection/onsale', data: {ids: ids}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            // 下架
            $('.btn-offline').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Fast.api.ajax({url: Config.moduleurl + '/nft/collection/offline', data: {ids: ids}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            // 铸造
            $('.btn-mint').on('click', function () {
                var ids = Table.api.selectedids(table);
                if (!ids) {
                    Toastr.error('请先选择');
                    return;
                }
                Fast.api.ajax({url: Config.moduleurl + '/nft/collection/mint', data: {ids: ids}}, function () {
                    table.bootstrapTable('refresh');
                });
            });

            table.bootstrapTable({
                url: $.fn.bootstrapTable.defaults.extend.index_url,
                pk: 'id',
                sortName: 'weigh',
                columns: [
                    [
                        {checkbox: true},
                        {field: 'id', title: __('Id')},
                        {field: 'category.name', title: __('Category_id'), operate: 'LIKE'},
                        {field: 'series.name', title: __('Series_id'), operate: 'LIKE'},
                        {field: 'name', title: __('Name'), align: 'left'},
                        {field: 'image', title: __('Image'), operate: false, events: Table.api.events.image, formatter: Table.api.formatter.image},
                        {field: 'creator', title: __('Creator'), operate: 'LIKE'},
                        {field: 'price', title: __('Price'), operate: false},
                        {field: 'stock', title: __('Stock'), operate: false},
                        {field: 'minted_count', title: __('Minted_count'), operate: false},
                        {field: 'sale_status', title: __('Sale_status'), searchList: {not_started: '未开始', on_sale: '发售中', ended: '已结束', sold_out: '已售罄'}, formatter: Table.api.formatter.label},
                        {field: 'start_time', title: __('Start_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'end_time', title: __('End_time'), operate: 'RANGE', addclass: 'datetimerange', formatter: Table.api.formatter.datetime},
                        {field: 'is_recommend', title: __('Is_recommend'), searchList: {'0': '否', '1': '是'}, formatter: Table.api.formatter.toggle},
                        {field: 'consign_open', title: '允许寄售', searchList: {'0': '禁止寄售', '1': '允许寄售'}, formatter: Table.api.formatter.toggle},
                        {
                            field: 'consign_price_min', title: '寄售限价区间', operate: false,
                            formatter: function (value, row) {
                                var min = parseFloat(row.consign_price_min || 0);
                                var max = parseFloat(row.consign_price_max || 0);
                                if (min <= 0 && max <= 0) {
                                    return '<span class="label label-default">不限</span>';
                                }
                                var minText = min > 0 ? min.toFixed(2) : '不限';
                                var maxText = max > 0 ? max.toFixed(2) : '不限';
                                return '<span class="label label-info">' + minText + ' ~ ' + maxText + '</span>';
                            }
                        },
                        {field: 'weigh', title: __('Weigh'), operate: false},
                        {field: 'status', title: __('Status'), searchList: {normal: '正常', hidden: '隐藏'}, formatter: Table.api.formatter.status},
                        {
                            field: 'operate',
                            title: __('Operate'),
                            table: table,
                            events: Table.api.events.operate,
                            formatter: function (value, row, index) {
                                var html = Table.api.formatter.operate.call(this, value, row, index);
                                html += ' <a href="javascript:;" class="btn btn-xs btn-success btn-onsale-row" data-id="' + row.id + '"><i class="fa fa-rocket"></i> 发售</a>';
                                html += ' <a href="javascript:;" class="btn btn-xs btn-warning btn-offline-row" data-id="' + row.id + '"><i class="fa fa-stop"></i> 下架</a>';
                                html += ' <a href="javascript:;" class="btn btn-xs btn-info btn-mint-row" data-id="' + row.id + '"><i class="fa fa-chain"></i> 铸造</a>';
                                return html;
                            }
                        }
                    ]
                ]
            });

            Table.api.bindevent(table);

            // 行内按钮
            $(document).on('click', '.btn-onsale-row', function () {
                Fast.api.ajax({url: Config.moduleurl + '/nft/collection/onsale', data: {ids: $(this).data('id')}}, function () {
                    table.bootstrapTable('refresh');
                });
            });
            $(document).on('click', '.btn-offline-row', function () {
                Fast.api.ajax({url: Config.moduleurl + '/nft/collection/offline', data: {ids: $(this).data('id')}}, function () {
                    table.bootstrapTable('refresh');
                });
            });
            $(document).on('click', '.btn-mint-row', function () {
                Fast.api.ajax({url: Config.moduleurl + '/nft/collection/mint', data: {ids: $(this).data('id')}}, function () {
                    table.bootstrapTable('refresh');
                });
            });
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
