// $.post('http://localhost:9999/test', {'key': 'value'});
$.ajax({
    type: "POST",
    url: '/C860008BD249',
    data: JSON.stringify({'profile':{ 'd_name': 'sample da', 'dm_name': 'Sample-DA', 'u_name': 'yb', 'is_sim': false, 'df_list': ['Acceleration', 'Temperature']}}),
    dataType: 'json',
    contentType:"application/json; charset=utf-8",
});
