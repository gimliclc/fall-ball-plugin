<?php

defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

class DFS_NBA_Cron {
  public static function load_stats() {
    $result_arr = array();

    $home_stats_url = "http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/Home";
    // Save response from URL to variable
    $home_stats_response = file_get_contents($home_stats_url);
    $home_dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $home_dom->loadHTML($home_stats_response);
    // Lets you search for specific elements using xpath
		$home_xpath = new DOMXPath($home_dom);
    // Use xpath to search for all tr elements and save to result rows
    $home_player_query = '//tr';
    $home_result_rows = $home_xpath ->query($home_player_query);
    foreach ($home_result_rows as $home_player){
      $home_player_tds = $home_xpath->query('//td', $home_player);

      $playerNameNode = $home_xpath->query('//a', $home_player_tds->item(1));

      if($playerNameNode->item(0)->nodeValue == "Player"){
        continue;
      }

      $home_player_obj = array(
        "playerId" => $home_player_tds->item(0)->nodeValue,
        "name" => $playerNameNode->item(0)->nodeValue,
        "playerUrl" => $playerNameNode->item(0)->attributes->getNamedItem("href"),
        "team" => $home_player_tds->item(2)->nodeValue,
        "gp" => $home_player_tds->item(3)->nodeValue,
      );

      $result_arr[] = $home_player_obj;
      //$home_player_id = item();
    //  $home_player_name = item(1);
    //  $home_minutes_per_game = item(5);
    //  $home_field_goals = item(6);
    //  $home_three_pointers = item(9);
    //  $home_free_throws = item(12);
    //  $home_rebounds = item(19);
    //  $home_assists = item(20);
    //  $home_steals = item(21);
    //  $home_blocks = item(22);
    //  $home_turnovers = item(15);
    //  $result_arr[] = $home_player;
    }


    $testPlayer1 = array(
      "playerId" => 1,
      "name" => "Test Player",
      "team" => "CHI",
      "minutesAvg" => 14.5,
      "field_goals" =>9.5,
      "isHome" => true
    );
    $testPlayer2 = array(
      "playerId" => 1,
      "name" => "Second Person",
      "team" => "LAC",
      "minutesAvg" => 19.5,
      "field_goals" =>3.5,
      "isHome" => false
    );

    //$result_arr[] = $testPlayer1;
    //$result_arr[] = $testPlayer2;

    #Wordpress transients allow us to temporarily store a variable to be referenced elsewhere.
    #We will want to store our processed data here so that it doesn't have to be processed on every page request
    set_transient('dfs_nba_stats', $result_arr, 60*60*48 );
    error_log("Executed NBA DFS cron job",0);
  }
}
