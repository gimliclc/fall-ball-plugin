var DfsNba = (function() {

  var buildTable = function(data) {
    var table = jQuery('#dfs-nba-table');

    if(!table || !data){
      return;
    }

    table.empty();
    var DKtableHeader = jQuery("<table id='nba-table' class='sortable'>" +
                            "<thead class='dk-nba-table-header' id='draftkings-nba'><td class='player-name' title='Players name'>" + "Player Name" +
                            "</td><td id='nba-pos' class='nba-mobile-hide' title='Player's team'>" + "Team" +
                            "</td><td id='nba-pos' title='Opponent'>" + "Opp" +
                            "</td><td id='nba-pos' title='Draftkings position'>" + "POS" +
                            "</td><td title='Projected minutes' class='nba-mobile-hide'>" + "Min" +
                            "</td><td title='Projected fantasy points'>" + "Proj" +
                            "</td><td id='nba-price' title='Draftkings cost' class='nba-mobile-hide'>" + "Price" +
                            "</td><td title='Projected value (Over 5.5x is good)'>" + "Val" +
                            "</td><td id='nba-inj' title='Player injured?'>" + "Inj?" +
                            "</td><td id='nba-note' title='Player note'>" + "Note" +
                            "</td><td title='Defense vs position'>" + "DvP" +
                            "</td><td title='Projected points'>" + "PTS" +
                            "</td><td title='Projected rebounds'>" + "Reb" +
                            "</td><td title='Projected assists'>" + "Ast" +
                            "</td><td title='Projected steals'>" + "Stl" +
                            "</td><td title='Projected blocks'>" + "Blk" +
                            "</td><td title='Projected turnovers'>" + "TO" +
                            "</td><td id='nba-game-info'>" + "Game (Draftkings)" +
                            "</td></thead></table>");
    table.append(DKtableHeader)
    for(var i=0; i < data.length; i++){
      let minutes = data[i]['minutes'];
      // Tie calculations from data to the minutes for updated projections
      let field_goals_per_min = (parseFloat(data[i]['field_goals']) / parseFloat(minutes));
      let three_points_per_min = (parseFloat(data[i]['three_pointers']) / parseFloat(minutes));
      let free_throws_per_min = (parseFloat(data[i]['free_throws']) / parseFloat(minutes));
      let rebounds_per_min = (parseFloat(data[i]['rebounds']) / parseFloat(minutes));
      let assists_per_min = (parseFloat(data[i]['assists']) / parseFloat(minutes));
      let steals_per_min = (parseFloat(data[i]['steals']) / parseFloat(minutes));
      let blocks_per_min = (parseFloat(data[i]['blocks']) / parseFloat(minutes));
      let turnovers_per_min = (parseFloat(data[i]['turnovers']) / parseFloat(minutes));
      // Calculate projected number of points to score
      let points = (((parseFloat(field_goals_per_min)*2) + parseFloat(three_points_per_min) + parseFloat(free_throws_per_min))*minutes).toFixed(1);
      let three_points = (parseFloat(three_points_per_min) * parseFloat(minutes)).toFixed(1);
      let free_throws = (parseFloat(free_throws_per_min) * parseFloat(minutes)).toFixed(1);
      let rebounds = (parseFloat(rebounds_per_min) * parseFloat(minutes)).toFixed(1);
      let assists = (parseFloat(assists_per_min) * parseFloat(minutes)).toFixed(1);
      let steals = (parseFloat(steals_per_min) * parseFloat(minutes)).toFixed(1);
      let blocks = (parseFloat(blocks_per_min) * parseFloat(minutes)).toFixed(1);
      let turnovers = (parseFloat(turnovers_per_min) * parseFloat(minutes)).toFixed(1);
      // Create function to determine odds of double double
      function dbl_odds(stats){
        if (stats > 10){
          return 1;
        }
        else {
          return (stats/10);
        }
      }
      let dbl_comparison_arr = [];
      let dbl_dbl_odds = 0;
      let trp_dbl_odds = 0;
      let pts_dbl_odds = dbl_odds(points);
      let reb_dbl_odds = dbl_odds(rebounds);
      let assists_dbl_odds = dbl_odds(assists);
      dbl_comparison_arr.push(pts_dbl_odds);
      dbl_comparison_arr.push(reb_dbl_odds);
      dbl_comparison_arr.push(assists_dbl_odds);
      // Sort array
      dbl_comparison_arr.sort();
      // Code to determine odds of a double double
      if ((pts_dbl_odds == 1 && reb_dbl_odds == 1) || (pts_dbl_odds == 1 && assists_dbl_odds == 1) || (reb_dbl_odds == 1 && assists_dbl_odds == 1)){
        dbl_dbl_odds = 1;
      }
      else {
        dbl_dbl_odds = dbl_comparison_arr[1];
      }
      // Code to determine odds of a triple double
      if (pts_dbl_odds == 1 && reb_dbl_odds == 1 && assists_dbl_odds == 1){
        trp_dbl_odds = 1;
      }
      else {
        trp_dbl_odds = dbl_comparison_arr[0];
      }
      // Calculate player projection
      let dk_proj = (parseFloat(points)+
                  (parseFloat(data[i]['three_pointers'])*0.5)+
                  (parseFloat(data[i]['rebounds'])*1.25)+
                  (parseFloat(data[i]['assists'])*1.5)+
                  (parseFloat(data[i]['steals'])*2)+
                  (parseFloat(data[i]['blocks'])*2)+
                  (parseFloat(data[i]['turnovers'])*(-0.5))+
                  (parseFloat(dbl_dbl_odds)*1.5)+
                  (parseFloat(trp_dbl_odds)*3)).toFixed(1);
      let dk_value = ((dk_proj) / ((parseFloat(data[i]['dk_price']))/1000)).toFixed(1);
      // Assign each player row
      var dk_playerRow = jQuery("<tr id='draftkings-nba'><td class='player-name'>" + data[i]['dk_name'] +
                              "</td><td>" + data[i]['team'] +
                              "</td><td>" + data[i]['opponent'] +
                              "</td><td id='nba-pos'>" + data[i]['dk_position'] +
                              "</td><td>" + minutes +
                              "</td><td>" + dk_proj +
                              "</td><td id='nba-price'>" + "$" + data[i]['dk_price'] +
                              "</td><td>" + dk_value +
                              "</td><td id='nba-inj'>" + data[i]['injured'] +
                              "</td><td id='nba-note'>" + data[i]['injured note'] +
                              "</td><td>" + "DvP" +
                              "</td><td>" + points +
                              "</td><td>" + rebounds +
                              "</td><td>" + assists +
                              "</td><td>" + steals +
                              "</td><td>" + blocks +
                              "</td><td>" + turnovers +
                              "</td><td id='nba-game-info'>" + data[i]['game_info'] +
                              "</td></tr>");
      DKtableHeader.append(dk_playerRow);
    }
    // Create separate table for Fanduel
    var FDtableHeader = jQuery("<table id='nba-table' class='sortable'>" +
                            "<thead class='fd-nba-table-header' id='fanduel-nba'><td class='player-name' title='Players name'>" + "Player Name" +
                            "</td><td id='nba-pos' title='Player's team'>" + "Team" +
                            "</td><td id='nba-pos' title='Opponent'>" + "Opp" +
                            "</td><td id='nba-pos' title='Draftkings position'>" + "POS" +
                            "</td><td title='Projected minutes'>" + "Min" +
                            "</td><td title='Projected fantasy points'>" + "Proj" +
                            "</td><td id='nba-price' title='Draftkings cost'>" + "Price" +
                            "</td><td title='Projected value (Over 5.5x is good)'>" + "Val" +
                            "</td><td id='nba-inj' title='Player injured?'>" + "Inj?" +
                            "</td><td id='nba-note' title='Player note'>" + "Note" +
                            "</td><td title='Defense vs position'>" + "DvP" +
                            "</td><td title='Projected points'>" + "PTS" +
                            "</td><td title='Projected rebounds'>" + "Reb" +
                            "</td><td title='Projected assists'>" + "Ast" +
                            "</td><td title='Projected steals'>" + "Stl" +
                            "</td><td title='Projected blocks'>" + "Blk" +
                            "</td><td title='Projected turnovers'>" + "TO" +
                            "</td><td id='nba-game-info'>" + "Game (Fanduel)" +
                            "</td></thead></table>");
                            table.append(FDtableHeader)
    for(var i=0; i < data.length; i++){
      let minutes = data[i]['minutes'];
      // Tie calculations from data to the minutes for updated projections
      let field_goals_per_min = (parseFloat(data[i]['field_goals']) / parseFloat(minutes));
      let three_points_per_min = (parseFloat(data[i]['three_pointers']) / parseFloat(minutes));
      let free_throws_per_min = (parseFloat(data[i]['free_throws']) / parseFloat(minutes));
      let rebounds_per_min = (parseFloat(data[i]['rebounds']) / parseFloat(minutes));
      let assists_per_min = (parseFloat(data[i]['assists']) / parseFloat(minutes));
      let steals_per_min = (parseFloat(data[i]['steals']) / parseFloat(minutes));
      let blocks_per_min = (parseFloat(data[i]['blocks']) / parseFloat(minutes));
      let turnovers_per_min = (parseFloat(data[i]['turnovers']) / parseFloat(minutes));
      // Calculate projected number of points to score
      let points = (((parseFloat(field_goals_per_min)*2) + parseFloat(three_points_per_min) + parseFloat(free_throws_per_min))*minutes).toFixed(1);
      let three_points = (parseFloat(three_points_per_min) * parseFloat(minutes)).toFixed(1);
      let free_throws = (parseFloat(free_throws_per_min) * parseFloat(minutes)).toFixed(1);
      let rebounds = (parseFloat(rebounds_per_min) * parseFloat(minutes)).toFixed(1);
      let assists = (parseFloat(assists_per_min) * parseFloat(minutes)).toFixed(1);
      let steals = (parseFloat(steals_per_min) * parseFloat(minutes)).toFixed(1);
      let blocks = (parseFloat(blocks_per_min) * parseFloat(minutes)).toFixed(1);
      let turnovers = (parseFloat(turnovers_per_min) * parseFloat(minutes)).toFixed(1);
      // Calculate player projection
      let fd_proj = (parseFloat(points)+
                  (parseFloat(data[i]['three_pointers'])*0.5)+
                  (parseFloat(data[i]['rebounds'])*1.25)+
                  (parseFloat(data[i]['assists'])*1.5)+
                  (parseFloat(data[i]['steals'])*2)+
                  (parseFloat(data[i]['blocks'])*2)+
                  (parseFloat(data[i]['turnovers'])*(-0.5))).toFixed(1);
      let fd_value = ((fd_proj) / ((parseFloat(data[i]['fd_price']))/1000)).toFixed(1);
      // Assign each player row
      var fd_playerRow = jQuery("<tr id='draftkings-nba'><td class='player-name'>" + data[i]['dk_name'] +
                              "</td><td>" + data[i]['team'] +
                              "</td><td>" + data[i]['opponent'] +
                              "</td><td id='nba-pos'>" + data[i]["fd_position"] +
                              "</td><td>" + minutes +
                              "</td><td>" + fd_proj +
                              "</td><td id='nba-price'>" + "$" + data[i]['fd_price'] +
                              "</td><td>" + fd_value +
                              "</td><td id='nba-inj'>" + data[i]['injured'] +
                              "</td><td id='nba-note'>" + data[i]['injured note'] +
                              "</td><td>" + "DvP" +
                              "</td><td>" + points +
                              "</td><td>" + rebounds +
                              "</td><td>" + assists +
                              "</td><td>" + steals +
                              "</td><td>" + blocks +
                              "</td><td>" + turnovers +
                              "</td><td id='nba-game-info'>" + data[i]['game_info'] +
                              "</td></tr>");
                  FDtableHeader.append(fd_playerRow);
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
    //Assumed that we're able to find our container, will initiate an ajax call through wordpress
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
          var newTableObject = document.getElementById('nba-table');
          sorttable.makeSortable(newTableObject)
        }

      },
      error: function(errorThrown){
        console.log(errorThrown);
      }
    });
  }
});
