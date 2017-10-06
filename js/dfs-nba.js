var DfsNba = (function() {

  var buildTable = function(data) {
    var table = jQuery('#dfs-nba-table');

    if(!table || !data){
      return;
    }

    table.empty();

    for(var i=0; i < data.length; i++){
      var tempEl = jQuery("<tr><td>" + JSON.stringify(data[i]) + "</td></tr>");
      table.append(tempEl.html())
    }

  };

  return {
    buildTable: buildTable
  }
})();

jQuery(document).ready(function() {
  if(jQuery('#dfs-nba-table')){
    jQuery.ajax({
      type: "POST",
      url: ajaxurl,
      dataType: 'json',
      cache: false,
      data: {
        'action':'dfs_nba'
      },
      success:function(data) {
        var stats = [];
        jQuery.each(data, function(key, val) {
          stats.push(val);
        });

        if(stats.length > 0){
          DfsNba.buildTable(stats);
          jQuery('#dfs-nba-table').show();
        }
      },
      error: function(errorThrown){
        console.log(errorThrown);
      }
    });
  }
});
