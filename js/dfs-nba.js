var DfsNba = (function() {

  var buildTable = function(data) {
    var table = jQuery('#dfs-nba-table');

    if(!table || !data){
      return;
    }

    table.empty();

    for(var i=0; i < data.length; i++){
      var playerRow = jQuery("<tr><td>" + data[i]['dk_name'] + "</td><td>" + data[i]['dk_fppg'] + "</td><td>" + data[i]['minutes'] + "</td><td>" + data[i]['three_pointers'] + "</td></tr>");
      table.append(playerRow)
    }
  };

  //Methods placed here will be considered "public" and can be acessed through the global namespace
  //Methods not placed into this returned object are considered "private"
  return {
    buildTable: buildTable
  }
})();

//This function will execute once the page has finished building itself
jQuery(document).ready(function() {
  if(jQuery('#dfs-nba-table')){
    //Assumed that we're able to find our container, will will initiate an ajax call through wordpress
    //We must supply our action through a wordpress post
    jQuery.ajax({
      type: "POST",
      url: ajaxurl,
      dataType: 'json',
      cache: false,
      data: {
        'action':'dfs_nba'
      },
      success:function(data) {
        //If the server responsed successfully (no 500 errors) this method will execute

        var stats = [];

        //Processes through each item in the returned data
        //Could take a different approach if this data doesn't need further processing
        jQuery.each(data, function(key, val) {
          stats.push(val);
        });


        if(stats.length > 0){
          //Send the data off to our class DfsNba and public method buildTable
          DfsNba.buildTable(stats);
          //Once processing is complete go ahead and show the table (it's initially hidden)
          jQuery('#dfs-nba-table').show();
        }
      },
      error: function(errorThrown){
        console.log(errorThrown);
      }
    });
  }
});
