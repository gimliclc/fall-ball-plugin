var DfsNba = (function() {
    var buildTable = function(data) {
        var table = jQuery('#dfs-nba-table');
        if (!table || !data) {
            return;
        }
        table.empty();
        var DKtableHeader = jQuery("<table id='dk-nba-table' class='sortable'>" + "<thead class='dk-nba-table-header' id='draftkings-nba'><td class='player-name' title='Players name'>" + "Player Name" + "</td><td id='nba-team' class='nba-mobile-hide' title='Player's team'>" + "Team" + "</td><td id='nba-opp' title='Opponent'>" + "Opp" + "</td><td id='nba-pos' title='Draftkings position'>" + "POS" + "</td><td title='Projected minutes' class='nba-mobile-hide' id='nba-minutes'>" + "Min" + "</td><td title='Projected fantasy points' id='nba-proj'>" + "Proj" + "</td><td id='nba-price' title='Draftkings cost' class='nba-mobile-hide'>" + "Price" + "</td><td title='Projected value (Over 5.5x is good)' id='nba-value'>" + "Val" + "</td><td id='nba-inj' title='Player injured?'>" + "Inj?" + "</td><td id='nba-note' title='Player note'>" + "Note" + "</td><td title='Defense vs position' id='nba-dvp'>" + "DvP" + "</td><td title='Projected points' id='nba-points'>" + "PTS" + "</td><td title='Projected rebounds' id='nba-rebounds'>" + "Reb" + "</td><td title='Projected assists' id='nba-assists'>" + "Ast" + "</td><td title='Projected steals' id='nba-steals'>" + "Stl" + "</td><td title='Projected blocks' id='nba-blocks'>" + "Blk" + "</td><td title='Projected turnovers' id='nba-turnovers'>" + "TO" + "</td><td id='nba-game-info'>" + "Game (Draftkings)" + "</td></thead></table>");
        table.append(DKtableHeader)
        for (var i = 0; i < data.length; i++) {
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
            let points = (((parseFloat(field_goals_per_min) * 2) + parseFloat(three_points_per_min) + parseFloat(free_throws_per_min)) * minutes).toFixed(1);
            let three_points = (parseFloat(three_points_per_min) * parseFloat(minutes)).toFixed(1);
            let free_throws = (parseFloat(free_throws_per_min) * parseFloat(minutes)).toFixed(1);
            let rebounds = (parseFloat(rebounds_per_min) * parseFloat(minutes)).toFixed(1);
            let assists = (parseFloat(assists_per_min) * parseFloat(minutes)).toFixed(1);
            let steals = (parseFloat(steals_per_min) * parseFloat(minutes)).toFixed(1);
            let blocks = (parseFloat(blocks_per_min) * parseFloat(minutes)).toFixed(1);
            let turnovers = (parseFloat(turnovers_per_min) * parseFloat(minutes)).toFixed(1);
            // Create function to determine odds of double double
            function dbl_odds(stats) {
                if (stats > 10) {
                    return 1;
                } else {
                    return (stats / 10);
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
            if ((pts_dbl_odds == 1 && reb_dbl_odds == 1) || (pts_dbl_odds == 1 && assists_dbl_odds == 1) || (reb_dbl_odds == 1 && assists_dbl_odds == 1)) {
                dbl_dbl_odds = 1;
            } else {
                dbl_dbl_odds = dbl_comparison_arr[1];
            }
            // Code to determine odds of a triple double
            if (pts_dbl_odds == 1 && reb_dbl_odds == 1 && assists_dbl_odds == 1) {
                trp_dbl_odds = 1;
            } else {
                trp_dbl_odds = dbl_comparison_arr[0];
            }
            // Calculate player projection
            let dk_proj = (parseFloat(points) + (parseFloat(data[i]['three_pointers']) * 0.5) +
             (parseFloat(data[i]['rebounds']) * 1.25) + (parseFloat(data[i]['assists']) * 1.5) +
              (parseFloat(data[i]['steals']) * 2) + (parseFloat(data[i]['blocks']) * 2) +
               (parseFloat(data[i]['turnovers']) * (-0.5)) + (parseFloat(dbl_dbl_odds) * 1.5) +
                (parseFloat(trp_dbl_odds) * 3)).toFixed(1);
            // If projection is not a number set to 0
            if (dk_proj == "NaN"){
              dk_proj = 0;
            }
            let dk_value = ((dk_proj) / ((parseFloat(data[i]['dk_price'])) / 1000)).toFixed(1);
            if (data[i]['opponent'] == ""){
              console.log("Removed " + data[i]['dk_name'] + " from DK");
            }
            else {
              // Assign each player row
              if(dfsIsPluginAdmin){
               var dk_playerRow = jQuery("<tr id='draftkings-nba'><td class='player-name'>" + data[i]['dk_name'] +
               "</td><td id='nba-team'>" + data[i]['team']  +
                "</td><td id='nba-opp'>" + data[i]['opponent'] +
                 "</td><td id='nba-pos'>" + data[i]['dk_position'] +
                  "</td><td id='nba-minutes'>"+ "<input placeholder=" + minutes + ">" +
                   "</td><td id='nba-proj'>" + dk_proj +
                    "</td><td id='nba-price'>" + "$" + data[i]['dk_price'] +
                     "</td><td id='nba-value'>" + dk_value +
                      "</td><td id='nba-inj'>" + "<input placeholder=" + data[i]['injured'] + ">" +
                       "</td><td id='nba-note'>" + "<input placeholder=" + data[i]['injured note'] + ">" +
                        "</td><td id='nba-dvp'>" + "<input placeholder=" + "DvP" + ">" +
                         "</td><td id='nba-points'>" + "<input placeholder=" + points + ">" +
                          "</td><td id='nba-rebounds'>" + "<input placeholder=" + rebounds + ">" +
                           "</td><td id='nba-assists'>" + "<input placeholder=" + assists + ">" +
                            "</td><td id='nba-steals'>" + "<input placeholder=" + steals + ">" +
                             "</td><td id='nba-blocks'>" + "<input placeholder=" + blocks + ">" +
                              "</td><td id='nba-turnovers'>" + "<input placeholder=" + turnovers + ">" +
                               "</td><td id='nba-game-info'>" + data[i]['game_info'] + "</td></tr>");
                }
                else {
              var dk_playerRow = jQuery("<tr id='draftkings-nba'><td class='player-name'>" + data[i]['dk_name'] +
               "</td><td id='nba-team'>" + data[i]['team'] +
                "</td><td id='nba-opp'>" + data[i]['opponent'] +
                 "</td><td id='nba-pos'>" + data[i]['dk_position'] +
                  "</td><td id='nba-minutes'>" + minutes +
                   "</td><td id='nba-proj'>" + dk_proj +
                    "</td><td id='nba-price'>" + "$" + data[i]['dk_price'] +
                     "</td><td id='nba-value'>" + dk_value +
                      "</td><td id='nba-inj'>" + data[i]['injured'] +
                       "</td><td id='nba-note'>" + data[i]['injured note'] +
                        "</td><td id='nba-dvp'>" + "DvP" +
                         "</td><td id='nba-points'>" + points +
                          "</td><td id='nba-rebounds'>" + rebounds +
                           "</td><td id='nba-assists'>" + assists +
                            "</td><td id='nba-steals'>" + steals +
                             "</td><td id='nba-blocks'>" + blocks +
                              "</td><td id='nba-turnovers'>" + turnovers +
                               "</td><td id='nba-game-info'>" + data[i]['game_info'] + "</td></tr>");

                }
                DKtableHeader.append(dk_playerRow);
            }

        }
        var dkTable = document.getElementById('dk-nba-table');
        jQuery('#dk-nba-table').DataTable( {
          order: [[6, 'desc']],
          scrollY:        "450px",
          scrollCollapse: true,
          paging:         false,
        initComplete: function () {
            this.api().columns([1,3,17]).every( function () {
                var column = this;
                var select = jQuery('<select><option value=""></option></select>')
                    .appendTo(jQuery(column.header()).empty())
                    .on('change', function () {
                        var val = jQuery.fn.dataTable.util.escapeRegex(
                            jQuery(this).val()
                        );

                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    });

                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                });
            });
        }
    });
        // Create separate table for Fanduel
        var FDtableHeader = jQuery("<table id='fd-nba-table' class='sortable'>" + "<thead class='fd-nba-table-header' id='fanduel-nba'><td class='player-name' title='Players name'>" + "Player Name" + "</td><td id='nba-team' class='nba-mobile-hide' title='Player's team'>" + "Team" + "</td><td id='nba-opp' title='Opponent'>" + "Opp" + "</td><td id='nba-pos' title='Fanduel position'>" + "POS" + "</td><td title='Projected minutes' class='nba-mobile-hide' id='nba-minutes'>" + "Min" + "</td><td title='Projected fantasy points' id='nba-proj'>" + "Proj" + "</td><td id='nba-price' title='Draftkings cost' class='nba-mobile-hide'>" + "Price" + "</td><td title='Projected value (Over 5.5x is good)' id='nba-value'>" + "Val" + "</td><td id='nba-inj' title='Player injured?'>" + "Inj?" + "</td><td id='nba-note' title='Player note'>" + "Note" + "</td><td title='Defense vs position' id='nba-dvp'>" + "DvP" + "</td><td title='Projected points' id='nba-points'>" + "PTS" + "</td><td title='Projected rebounds' id='nba-rebounds'>" + "Reb" + "</td><td title='Projected assists' id='nba-assists'>" + "Ast" + "</td><td title='Projected steals' id='nba-steals'>" + "Stl" + "</td><td title='Projected blocks' id='nba-blocks'>" + "Blk" + "</td><td title='Projected turnovers' id='nba-turnovers'>" + "TO" + "</td><td id='nba-game-info'>" + "Game (Fanduel)" + "</td></thead></table>");
        table.append(FDtableHeader)
        for (var i = 0; i < data.length; i++) {
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
            let points = (((parseFloat(field_goals_per_min) * 2) + parseFloat(three_points_per_min) + parseFloat(free_throws_per_min)) * minutes).toFixed(1);
            let three_points = (parseFloat(three_points_per_min) * parseFloat(minutes)).toFixed(1);
            let free_throws = (parseFloat(free_throws_per_min) * parseFloat(minutes)).toFixed(1);
            let rebounds = (parseFloat(rebounds_per_min) * parseFloat(minutes)).toFixed(1);
            let assists = (parseFloat(assists_per_min) * parseFloat(minutes)).toFixed(1);
            let steals = (parseFloat(steals_per_min) * parseFloat(minutes)).toFixed(1);
            let blocks = (parseFloat(blocks_per_min) * parseFloat(minutes)).toFixed(1);
            let turnovers = (parseFloat(turnovers_per_min) * parseFloat(minutes)).toFixed(1);
            // Calculate player projection
            let fd_proj = (parseFloat(points) + (parseFloat(data[i]['rebounds']) * 1.2) +
             (parseFloat(data[i]['assists']) * 1.5) + (parseFloat(data[i]['steals']) * 3) +
              (parseFloat(data[i]['blocks']) * 3) + (parseFloat(data[i]['turnovers']) * (-1))).toFixed(1);
              if (fd_proj == "NaN"){
                fd_proj = 0;
              }
            let fd_value = ((fd_proj) / ((parseFloat(data[i]['fd_price'])) / 1000)).toFixed(1);
            let fd_price = data[i]['fd_price'];
            if (fd_price == ""){
              console.log("Didn't find " + data[i]['dk_name'] + " listed on FD" );
            }
            else {
              // Assign each player row
              var fd_playerRow = jQuery("<tr id='fanduel-nba'><td class='player-name'>" + data[i]['dk_name'] +
              "</td><td id='nba-team'>" + data[i]['team'] +
              "</td><td id='nba-opp'>" + data[i]['opponent'] +
              "</td><td id='nba-pos'>" + data[i]["fd_position"] +
              "</td><td id='nba-minutes'>" + minutes + "</td><td>" + fd_proj +
              "</td><td id='nba-price'>" + "$" + fd_price +
              "</td><td id='nba-value'>" + fd_value +
              "</td><td id='nba-inj'>" + data[i]['injured'] +
               "</td><td id='nba-note'>" + data[i]['injured note'] +
                "</td><td id='nba-dvp'>" + "DvP" +
                 "</td><td id='nba-points'>" + points +
                  "</td><td id='nba-rebounds'>" + rebounds +
                   "</td><td id='nba-assists'>" + assists +
                    "</td><td id='nba-steals'>" + steals +
                     "</td><td id='nba-blocks'>" + blocks +
                      "</td><td id='nba-turnovers'>" + turnovers + "</td><td id='nba-game-info'>" + data[i]['game_info'] + "</td></tr>");
              FDtableHeader.append(fd_playerRow);
            }

        }
        var fdTable = document.getElementById('fd-nba-table');
        jQuery('#fd-nba-table').DataTable( {
          "paging" : false,
          order: [[6, 'desc']],
          scrollY:        "450px",
          scrollCollapse: true,
          paging:         false,
        initComplete: function () {
            this.api().columns([1,3,17]).every( function () {
                var column = this;
                var select = jQuery('<select><option value=""></option></select>')
                    .appendTo(jQuery(column.header()).empty())
                    .on('change', function () {
                        var val = jQuery.fn.dataTable.util.escapeRegex(
                            jQuery(this).val()
                        );

                        column
                            .search( val ? '^'+val+'$' : '', true, false )
                            .draw();
                    });

                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                });
            });
        }
    });
        // Create separate table for Yahoo
        var YtableHeader = jQuery("<table id='y-nba-table' class='sortable'>" +
        "<thead class='y-nba-table-header' id='yahoo-nba'><td class='player-name' title='Players name'>" +
        "Player Name" + "</td><td id='nba-team' class='nba-mobile-hide' title='Player's team'>" + "Team" + "</td><td id='nba-opp' title='Opponent'>" + "Opp" + "</td><td id='nba-pos' title='Yahoo position'>" + "POS" + "</td><td title='Projected minutes' class='nba-mobile-hide' id='nba-minutes'>" + "Min" + "</td><td title='Projected fantasy points' id='nba-proj'>" + "Proj" + "</td><td id='nba-price' title='Draftkings cost' class='nba-mobile-hide'>" + "Price" + "</td><td title='Projected value (Over 5.5x is good)' id='nba-value'>" + "Val" +
        "</td><td id='nba-inj' title='Player injured?'>" + "Inj?" +
        "</td><td id='nba-note' title='Player note'>" + "Note" +
        "</td><td title='Defense vs position' id='nba-dvp'>" + "DvP" +
        "</td><td title='Projected points' id='nba-points'>" + "PTS" +
        "</td><td title='Projected rebounds' id='nba-rebounds'>" + "Reb" +
        "</td><td title='Projected assists' id='nba-assists'>" + "Ast" +
        "</td><td title='Projected steals' id='nba-steals'>" + "Stl" +
        "</td><td title='Projected blocks' id='nba-blocks'>" + "Blk" +
        "</td><td title='Projected turnovers' id='nba-turnovers'>" + "TO" +
        "</td><td id='nba-game-info'>" + "Game (Yahoo)" + "</td></thead></table>");
        table.append(YtableHeader)
        for (var i = 0; i < data.length; i++) {
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
            let points = (((parseFloat(field_goals_per_min) * 2) + parseFloat(three_points_per_min) + parseFloat(free_throws_per_min)) * minutes).toFixed(1);
            let three_points = (parseFloat(three_points_per_min) * parseFloat(minutes)).toFixed(1);
            let free_throws = (parseFloat(free_throws_per_min) * parseFloat(minutes)).toFixed(1);
            let rebounds = (parseFloat(rebounds_per_min) * parseFloat(minutes)).toFixed(1);
            let assists = (parseFloat(assists_per_min) * parseFloat(minutes)).toFixed(1);
            let steals = (parseFloat(steals_per_min) * parseFloat(minutes)).toFixed(1);
            let blocks = (parseFloat(blocks_per_min) * parseFloat(minutes)).toFixed(1);
            let turnovers = (parseFloat(turnovers_per_min) * parseFloat(minutes)).toFixed(1);
            // Calculate player projection
            let y_proj = (parseFloat(points) + (parseFloat(data[i]['rebounds']) * 1.2) +
             (parseFloat(data[i]['assists']) * 1.5) + (parseFloat(data[i]['steals']) * 3) +
              (parseFloat(data[i]['blocks']) * 3) + (parseFloat(data[i]['turnovers']) * (-1))).toFixed(1);
              if (y_proj == "NaN"){
                y_proj = 0;
              }
            let y_value = ((y_proj) / ((parseFloat(data[i]['y_price'])))).toFixed(1);
            let y_price = data[i]['y_price'];
            if (y_price == ""){}
            else if (data[i]['opponent'] == ""){
              console.log("Removed " + data[i]['dk_name'] + " from Y");
            }
            else {
              var y_playerRow = jQuery("<tr id='yahoo-nba'><td class='player-name'>" + data[i]['dk_name'] +
              "</td><td id='nba-team'>" + data[i]['team'] +
              "</td><td id='nba-opp'>" + data[i]['opponent'] +
              "</td><td id='nba-pos'>" + data[i]["y_position"] +
              "</td><td id='nba-minutes'>" + minutes + "</td><td>" + y_proj +
              "</td><td id='nba-price'>" + "$" + y_price +
              "</td><td id='nba-value'>" + y_value + "</td><td id='nba-inj'>" + data[i]['injured'] +
               "</td><td id='nba-note'>" + data[i]['injured note'] +
                "</td><td id='nba-dvp'>" + "DvP" +
                 "</td><td id='nba-points'>" + points +
                  "</td><td id='nba-rebounds'>" + rebounds +
                   "</td><td id='nba-assists'>" + assists +
                    "</td><td id='nba-steals'>" + steals +
                     "</td><td id='nba-blocks'>" + blocks +
                      "</td><td id='nba-turnovers'>" + turnovers + "</td><td id='nba-game-info'>" + data[i]['game_info'] + "</td></tr>");
              YtableHeader.append(y_playerRow);
            }
            // Assign each player row

        }
        var yTable = document.getElementById('y-nba-table');
        jQuery('#y-nba-table').DataTable( {
          order: [[6, 'desc']],
          scrollY:        "450px",
          scrollCollapse: true,
          paging:         false,
          initComplete: function () {
              this.api().columns([1,3,17]).every( function () {
                  var column = this;
                  var select = jQuery('<select><option value=""></option></select>')
                      .appendTo(jQuery(column.header()).empty())
                      .on('change', function () {
                          var val = jQuery.fn.dataTable.util.escapeRegex(
                              jQuery(this).val()
                          );

                          column
                              .search( val ? '^'+val+'$' : '', true, false )
                              .draw();
                      });

                  column.data().unique().sort().each( function ( d, j ) {
                      select.append( '<option value="'+d+'">'+d+'</option>' )
                  });
              });
          }
    });
    };
    //Methods placed here will be considered "public" and can be acessed through the global namespace
    //Methods not placed into this returned object are considered "private"
    return {
        buildTable: buildTable
    }
})();
//This function will execute once the page has finished building itself
jQuery(document).ready(function() {
    if (jQuery('#dfs-nba-table')) {
        //Assumed that we're able to find our container, will initiate an ajax call through wordpress
        //We must supply our action through a wordpress post
        jQuery.ajax({
            type: "POST",
            url: ajaxurl,
            dataType: 'json',
            cache: false,
            data: {
                'action': 'dfs_nba'
            },
            success: function(data) {
                //If the server responsed successfully (no 500 errors) this method will execute
                var stats = [];
                //Processes through each item in the returned data
                //Could take a different approach if this data doesn't need further processing
                jQuery.each(data, function(key, val) {
                    stats.push(val);
                });
                if (stats.length > 0) {
                    //Send the data off to our class DfsNba and public method buildTable
                    DfsNba.buildTable(stats);
                    //Once processing is complete go ahead and show the table (it's initially hidden)
                    jQuery("#dk-nba-table").show();
 jQuery("#dk-nba-table_info").show();
 jQuery("#dk-nba-table_filter").show();
 jQuery("#draftkings-nba").show();
 jQuery("#dk-nba-table_wrapper").show();
 jQuery("#y-nba-table").hide();
 jQuery("#y-nba-table_filter").hide();
 jQuery("#y-nba-table_info").hide();
 jQuery("#yahoo-nba").hide();
 jQuery("#y-nba-table_wrapper").hide();
 jQuery("#fd-nba-table").hide();
 jQuery("#fd-nba-table_filter").hide();
 jQuery("#fd-nba-table_info").hide();
 jQuery("#fanduel-nba").hide();
 jQuery("#fd-nba-table_wrapper").hide();
               }
           },
           error: function(errorThrown) {
               console.log(errorThrown);
           }
       });
   }
});

jQuery(".fanduel-button").click(function(){
 jQuery("#dk-nba-table").hide();
 jQuery("#dk-nba-table_info").hide();
 jQuery("#dk-nba-table_filter").hide();
 jQuery("#draftkings-nba").hide();
 jQuery("#dk-nba-table_wrapper").hide();
 jQuery("#y-nba-table").hide();
 jQuery("#y-nba-table_filter").hide();
 jQuery("#y-nba-table_info").hide();
 jQuery("#y-nba-table_wrapper").hide();
 jQuery("#yahoo-nba").hide();
 jQuery("#fd-nba-table").show();
 jQuery("#fd-nba-table_filter").show();
 jQuery("#fd-nba-table_info").show();
 jQuery("#fanduel-nba").show();
 jQuery("#fd-nba-table_wrapper").show();
});
jQuery(".draftkings-button").click(function(){
 jQuery("#dk-nba-table").show();
 jQuery("#dk-nba-table_info").show();
 jQuery("#dk-nba-table_filter").show();
 jQuery("#draftkings-nba").show();
 jQuery("#dk-nba-table_wrapper").show();
 jQuery("#y-nba-table").hide();
 jQuery("#y-nba-table_filter").hide();
 jQuery("#y-nba-table_info").hide();
 jQuery("#yahoo-nba").hide();
 jQuery("#y-nba-table_wrapper").hide();
 jQuery("#fd-nba-table").hide();
 jQuery("#fd-nba-table_filter").hide();
 jQuery("#fd-nba-table_info").hide();
 jQuery("#fanduel-nba").hide();
 jQuery("#fd-nba-table_wrapper").hide();
});
jQuery(".yahoo-button").click(function(){
 jQuery("#dk-nba-table").hide();
 jQuery("#dk-nba-table_info").hide();
 jQuery("#dk-nba-table_filter").hide();
 jQuery("#dk-nba-table_wrapper").hide();
 jQuery("#y-nba-table").show();
 jQuery("#y-nba-table_filter").show();
 jQuery("#y-nba-table_info").show();
 jQuery("#yahoo-nba").show();
 jQuery("#y-nba-table_wrapper").show();
 jQuery("#fd-nba-table").hide();
 jQuery("#fd-nba-table_filter").hide();
 jQuery("#fd-nba-table_info").hide();
 jQuery("#fanduel-nba").hide();
 jQuery("#fd-nba-table_wrapper").hide();
});
