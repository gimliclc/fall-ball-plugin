var DfsNba = (function() {
    //These will temporarily keep track of which input has focus on the admin inputs
    var delayedFn, blurredFrom;

    // Create function to determine odds of double double
    var dbl_odds = function(stats) {
	    if (stats > 10) {
		    return 1;
	    } else {
    		return (stats / 10);
	    }
    };

    var overrideSubmission = function(event) {
	var playerId = event.data.playerId;
	var stats = event.data.data;
	var dvp = event.data.dvp;
	var statsOverride = event.data.statsOverride;

	var inputValues = {
		playerID: playerId,
		minutes: jQuery('#' + playerId + '-minutes').val(),
		field_goals: "",
		three_pointers: "",
		free_throws: "",
		rebounds: jQuery('#' + playerId + '-reb').val(),
		assists: jQuery('#' + playerId + '-ast').val(),
		steals: jQuery('#' + playerId + '-stl').val(),
		blocks: jQuery('#' + playerId + '-bl').val(),
		turnovers: jQuery('#' + playerId + '-to').val(),
		injured: jQuery('#' + playerId + '-inj').val(),
		injured_note: jQuery('#' + playerId + '-inj_note').val()
	};

	//console.log(stats[playerId]["dk_name"]);
	//console.log(JSON.stringify(inputValues, null, 4));

	var resultObj = {
		'action': 'dfs_nba_update',
		//'player_update' : JSON.stringify(inputValues)
		'player_update' : inputValues
	};

	jQuery.ajax({
		type: "POST",
		url: ajaxurl,
		dataType: 'json',
		cache: false,
		data: resultObj,
		success: function(data) {
			initPage();
		},
		error: function(errorThrown) {
			console.log(errorThrown);
		}
	});
    };

    var buildTable = function(data, dvp, statsOverride) {
        var table = jQuery('#dfs-nba-table');
        if (!table || !data) {
            return;
        }
        table.empty();
        var DKtableHeader = jQuery("<table id='dk-nba-table' class='sortable'>" + "<thead class='dk-nba-table-header' id='draftkings-nba'><td class='player-name' title='Players name'>" + "Player Name" + "</td><td id='nba-team' class='nba-mobile-hide' title='Player's team'>" + "Team" + "</td><td id='nba-opp' title='Opponent'>" + "Opp" + "</td><td id='nba-pos' title='Draftkings position'>" + "POS" + "</td><td title='Projected minutes' class='nba-mobile-hide' id='nba-minutes'>" + "Min" + "</td><td title='Projected fantasy points' id='nba-proj'>" + "Proj" + "</td><td id='nba-price' title='Draftkings cost' class='nba-mobile-hide'>" + "Price" + "</td><td title='Projected value (Over 5.5x is good)' id='nba-value'>" + "Val" + "</td><td id='nba-inj' title='Player injured?'>" + "Inj?" + "</td><td id='nba-note' title='Player note'>" + "Note" + "</td><td title='Defense vs position' id='nba-dvp'>" + "DvP" + "</td><td title='Projected points' id='nba-points'>" + "PTS" + "</td><td title='Projected rebounds' id='nba-rebounds'>" + "Reb" + "</td><td title='Projected assists' id='nba-assists'>" + "Ast" + "</td><td title='Projected steals' id='nba-steals'>" + "Stl" + "</td><td title='Projected blocks' id='nba-blocks'>" + "Blk" + "</td><td title='Projected turnovers' id='nba-turnovers'>" + "TO" + "</td><td id='nba-game-info'>" + "Game (Draftkings)" + "</td></thead></table>");
        table.append(DKtableHeader)
        for (let i in data) {
            let player_minutes = data[i]['minutes'];
	    let player_fgs = data[i]['field_goals'];
	    let player_3pt = data[i]['three_pointers'];
	    let player_ft = data[i]['free_throws'];
	    let player_reb = data[i]['rebounds'];
	    let player_ast = data[i]['assists'];
	    let player_stl = data[i]['steals'];
	    let player_bl = data[i]['blocks'];
	    let player_to = data[i]['turnovers'];
	    let player_inj = data[i]['injured'];
	    let player_inj_note = data[i]['injured note'];

            let override_minutes = null;
	    let override_fgs = null;
	    let override_3pt = null;
	    let override_ft = null;
	    let override_reb = null;
	    let override_ast = null;
	    let override_stl = null;
	    let override_bl = null;
	    let override_to = null;
	    let override_inj = null;
	    let override_inj_note = null;

	    if(statsOverride[i]){
            	override_minutes = statsOverride[i]['minutes'] ? statsOverride[i]['minutes'] : null;
	    	override_fgs = statsOverride[i]['field_goals'] ? statsOverride[i]['field_goals'] : null;
	    	override_3pt = statsOverride[i]['three_pointers'] ? statsOverride[i]['three_pointers'] : null;
	    	override_ft = statsOverride[i]['free_throws'] ? statsOverride[i]['free_throws'] : null;
	    	override_reb = statsOverride[i]['rebounds'] ? statsOverride[i]['rebounds'] : null;
	    	override_ast = statsOverride[i]['assists'] ? statsOverride[i]['assists'] : null;
	    	override_stl = statsOverride[i]['steals'] ? statsOverride[i]['steals'] : null;
	    	override_bl = statsOverride[i]['blocks'] ? statsOverride[i]['blocks'] : null;
	    	override_to = statsOverride[i]['turnovers'] ? statsOverride[i]['turnovers'] : null;
	    	override_inj = statsOverride[i]['injured'] ? statsOverride[i]['injured'] : null;
	    	override_inj_note = statsOverride[i]['injured note'] ? statsOverride[i]['injured note'] : null;
	    }

            let display_minutes = override_minutes ? override_minutes : player_minutes;
	    let display_fgs = override_fgs ? override_fgs : player_fgs;
	    let display_3pt = override_3pt ? override_3pt : player_3pt;
	    let display_ft = override_ft ? override_ft : player_ft;
	    let display_reb = override_reb ? override_reb : player_reb;
	    let display_ast = override_ast ? override_ast : player_ast;
	    let display_stl = override_stl ? override_stl : player_stl;
	    let display_bl = override_bl ? override_bl : player_bl;
	    let display_to = override_to ? override_to : player_to;
	    let display_inj = override_inj ? override_inj : player_inj;
	    let display_inj_note = override_inj_note ? override_inj_note : player_inj_note;

            // Tie calculations from data to the minutes for updated projections
            let field_goals_per_min = (parseFloat(display_fgs) / parseFloat(display_minutes));
            let three_points_per_min = (parseFloat(display_3pt) / parseFloat(display_minutes));
            let free_throws_per_min = (parseFloat(display_ft) / parseFloat(display_minutes));
            let rebounds_per_min = (parseFloat(display_reb) / parseFloat(display_minutes));
            let assists_per_min = (parseFloat(display_ast) / parseFloat(display_minutes));
            let steals_per_min = (parseFloat(display_stl) / parseFloat(display_minutes));
            let blocks_per_min = (parseFloat(display_bl) / parseFloat(display_minutes));
            let turnovers_per_min = (parseFloat(display_to) / parseFloat(display_minutes));
            // Calculate projected number of points to score
            let points = (((parseFloat(field_goals_per_min) * 2) + parseFloat(three_points_per_min) + parseFloat(free_throws_per_min)) * display_minutes).toFixed(1);
            let three_points = (parseFloat(three_points_per_min) * parseFloat(display_minutes)).toFixed(1);
            let free_throws = (parseFloat(free_throws_per_min) * parseFloat(display_minutes)).toFixed(1);
            let rebounds = (parseFloat(rebounds_per_min) * parseFloat(display_minutes)).toFixed(1);
            let assists = (parseFloat(assists_per_min) * parseFloat(display_minutes)).toFixed(1);
            let steals = (parseFloat(steals_per_min) * parseFloat(display_minutes)).toFixed(1);
            let blocks = (parseFloat(blocks_per_min) * parseFloat(display_minutes)).toFixed(1);
            let turnovers = (parseFloat(turnovers_per_min) * parseFloat(display_minutes)).toFixed(1);

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
            let dk_proj = (parseFloat(points) + (parseFloat(display_3pt) * 0.5) +
             (parseFloat(display_reb) * 1.25) + (parseFloat(display_ast) * 1.5) +
              (parseFloat(display_stl) * 2) + (parseFloat(display_bl) * 2) +
               (parseFloat(display_to) * (-0.5)) + (parseFloat(dbl_dbl_odds) * 1.5) +
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
              var dk_playerRow = jQuery("<tr id='draftkings-nba'><td class='player-name'>" + data[i]['dk_name'] +
               "</td><td id='nba-team'>" + data[i]['team'] +
                "</td><td 'nba-opp'>" + data[i]['opponent'] +
                 "</td><td id='nba-pos'>" + data[i]['dk_position'] +
                  "</td><td id='nba-minutes'>" + display_minutes +
                   "</td><td id='nba-proj'>" + dk_proj +
                    "</td><td id='nba-price'>" + "$" + data[i]['dk_price'] +
                     "</td><td id='nba-value'>" + dk_value +
                      "</td><td id='nba-inj'>" + display_inj +
                       "</td><td id='nba-note'>" + display_inj_note +
                        "</td><td id='nba-dvp'>" + "DvP" +
                         "</td><td id='nba-points'>" + points +
                          "</td><td id='nba-rebounds'>" + display_reb +
                           "</td><td id='nba-assists'>" + display_ast +
                            "</td><td id='nba-steals'>" + display_stl +
                             "</td><td id='nba-blocks'>" + display_bl +
                              "</td><td id='nba-turnovers'>" + display_to +
                               "</td><td id='nba-game-info'>" + data[i]['game_info'] + "</td></tr>");

		
              if(dfsIsPluginAdmin){
			dk_playerRow = jQuery("<tr id='draftkings-nba'></tr>");
			dk_playerRow.append("<td class='player-name'>" + data[i]['dk_name'] + "</td>");
			dk_playerRow.append("<td id='nba-team'>" + data[i]['team'] + "</td>");
			dk_playerRow.append("<td id='nba-opp'>" + data[i]['opponent'] + "</td>");
			dk_playerRow.append("<td id='nba-pos'>" + data[i]['dk_position'] + "</td>");
			dk_playerRow.append("<td id='nba-minutes'>" + "<input name='" + i + "-minutes' id='" + i + "-minutes' placeholder='" + player_minutes + "' value='" + (override_minutes ? override_minutes : "") + "' style='" + (override_minutes ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-proj'>" + dk_proj + "</td>");
			dk_playerRow.append("<td id='nba-price'>" + "$" + data[i]['dk_price'] + "</td>");
			dk_playerRow.append("<td id='nba-value'>" + dk_value + "</td>");
			dk_playerRow.append("<td id='nba-inj'>" + "<input name='" + i + "-inj' id='" + i + "-inj' placeholder='" + player_inj + "' value='" + (override_inj ? override_inj : "") + "' style='" + (override_inj ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-note'>" + "<input name='" + i + "-inj_note' id='" + i + "-inj_note' placeholder='" + player_inj_note + "' value='" + (override_inj_note ? override_inj_note : "") + "' style='" + (override_inj_note ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-dvp'>" + "<input placeholder='" + "DvP" + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-points'>" + "<input placeholder='" + points + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-rebounds'>" + "<input name='" + i + "-reb' id='" + i + "-reb' placeholder='" + player_reb + "' value='" + (override_reb ? override_reb : "") + "' style='" + (override_reb ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-assists'>" + "<input name='" + i + "-ast' id='" + i + "-ast' placeholder='" + player_ast + "' value='" + (override_ast ? override_ast : "") + "' style='" + (override_ast ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-steals'>" + "<input name='" + i + "-stl' id='" + i + "-stl' placeholder='" + player_stl + "' value='" + (override_stl ? override_stl : "") + "' style='" + (override_stl ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-blocks'>" + "<input name='" + i + "-bl' id='" + i + "-bl' placeholder='" + player_bl + "' value='" + (override_bl ? override_bl : "") + "' style='" + (override_bl ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-turnovers'>" + "<input name='" + i + "-to' id='" + i + "-to' placeholder='" + player_to + "' value='" + (override_to ? override_to : "") + "' style='" + (override_to ? "background-color: yellow;" : "") + "'>" + "</td>");
			dk_playerRow.append("<td id='nba-game-info'>" + data[i]['game_info'] + "</td>");
			dk_playerRow.on("blur","input",{playerId: i, data:data, dvp:dvp, statsOverride:statsOverride},function(event){
				blurredFrom = event.delegateTarget;
				delayedFn = setTimeout(function() {overrideSubmission(event);}, 0);
			});
			dk_playerRow.on("focus","input",{data:data, dvp:dvp, statsOverride:statsOverride},function(event){
				if (blurredFrom === event.delegateTarget) {
     					clearTimeout(delayedFn);
    				}
			});
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
        for (var i in data) {
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
        for (var i in data) {
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

    var initPage = function() {
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
                var dvp = [];
                var statsOverride = [];

                if(data && data !== "null" && data !== "undefined" ){
                        if(data.stats && data.stats !== "null" && data.stats !== "undefined" ){
                                stats = data.stats;
                        }
                        if(data.dvp && data.dvp !== "null" && data.dvp !== "undefined" ){
                                dvp = data.dvp;
                        }
                        if(data.stats_override && data.stats_override !== "null" && data.stats_override !== "undefined" ){
                                statsOverride = data.stats_override;
                        }
                }

                if (Object.keys(stats).length > 0) {
                    //Send the data off to our class DfsNba and public method buildTable
                    buildTable(stats, dvp, statsOverride);
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
    };
    //Methods placed here will be considered "public" and can be acessed through the global namespace
    //Methods not placed into this returned object are considered "private"
    return {
	initPage: initPage
    }
})();
//This function will execute once the page has finished building itself
jQuery(document).ready(function() {
    if (jQuery('#dfs-nba-table')) {
        DfsNba.initPage();
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
