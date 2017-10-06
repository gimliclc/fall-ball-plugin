<?php

defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

class DFS_NBA_Cron {
  public static function load_stats() {
    $result_arr = array();

    $home_stats_array = array(
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/Home',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/2/Home',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/3/Home',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/4/Home',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/5/Home'
              );
    $home_dom = new DOMDocument();
    libxml_use_internal_errors(true);
    // Save response from URL to variable
    foreach ($home_stats_array as $home_stats_url){
        $home_stats_response = file_get_contents($home_stats_url);
        $home_dom->loadHTML($home_stats_response);
    }
    libxml_use_internal_errors(false);
    // Lets you search for specific elements using xpath
		$home_xpath = new DOMXPath($home_dom);
    // Use xpath to query for elements and save to variables
    $td_query = ".//td";
    $a_query = ".//a";
    $home_player_query = "//tr";
    $home_result_rows = $home_xpath ->query($home_player_query);
    foreach ($home_result_rows as $home_player){
      $home_player_tds = $home_xpath->query($td_query, $home_player);

      $playerNameNode = $home_player_tds->item(1);
      $playerNameLinkNode = $home_xpath->query($a_query, $playerNameNode);

      if($playerNameLinkNode->item(0)->getAttribute('href') == "/"){
        continue;
      }


      $home_player_obj = array(
        "playerId" => $home_player_tds->item(0)->nodeValue,
        "name" => $playerNameLinkNode->item(0)->nodeValue,
        "playerUrl" => $playerNameLinkNode->item(0)->getAttribute('href'),
        "team" => $home_player_tds->item(2)->nodeValue,
        "gp" => $home_player_tds->item(3)->nodeValue,
        "minutes" => $home_player_tds->item(4)->nodeValue,
        "field_goals" => $home_player_tds->item(5)->nodeValue,
        "three_pointers" => $home_player_tds->item(8)->nodeValue,
        "free_throws" => $home_player_tds->item(11)->nodeValue,
        "rebounds" => $home_player_tds->item(18)->nodeValue,
        "assists" => $home_player_tds->item(19)->nodeValue,
        "steals" => $home_player_tds->item(20)->nodeValue,
        "blocks" => $home_player_tds->item(21)->nodeValue,
        "turnovers" => $home_player_tds->item(14)->nodeValue
      );

      $result_arr[] = $home_player_obj;
    }

    $away_stats_array = array(
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/away',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/2/away',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/3/away',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/4/away',
                'http://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/5/away'
              );
    $away_dom = new DOMDocument();
    libxml_use_internal_errors(true);
    // Save response from URL to variable
    foreach ($away_stats_array as $away_stats_url){
        $away_stats_response = file_get_contents($away_stats_url);
        $away_dom->loadHTML($away_stats_response);
    }
    libxml_use_internal_errors(false);
    // Lets you search for specific elements using xpath
		$away_xpath = new DOMXPath($away_dom);
    // Use xpath to query for elements and save to variables
    $td_query = ".//td";
    $a_query = ".//a";
    $away_player_query = "//tr";
    $away_result_rows = $away_xpath ->query($away_player_query);
    foreach ($away_result_rows as $away_player){
      $away_player_tds = $away_xpath->query($td_query, $away_player);

      $playerNameNode = $away_player_tds->item(1);
      $playerNameLinkNode = $away_xpath->query($a_query, $playerNameNode);

      if($playerNameLinkNode->item(0)->getAttribute('href') == "/"){
        continue;
      }


      $away_player_obj = array(
        "playerId" => $away_player_tds->item(0)->nodeValue,
        "name" => $playerNameLinkNode->item(0)->nodeValue,
        "playerUrl" => $playerNameLinkNode->item(0)->getAttribute('href'),
        "team" => $away_player_tds->item(2)->nodeValue,
        "gp" => $away_player_tds->item(3)->nodeValue,
        "minutes" => $away_player_tds->item(4)->nodeValue,
        "field_goals" => $away_player_tds->item(5)->nodeValue,
        "three_pointers" => $away_player_tds->item(8)->nodeValue,
        "free_throws" => $away_player_tds->item(11)->nodeValue,
        "rebounds" => $away_player_tds->item(18)->nodeValue,
        "assists" => $away_player_tds->item(19)->nodeValue,
        "steals" => $away_player_tds->item(20)->nodeValue,
        "blocks" => $away_player_tds->item(21)->nodeValue,
        "turnovers" => $away_player_tds->item(14)->nodeValue
      );

      $result_arr[] = $away_player_obj;
    }

    #Wordpress transients allow us to temporarily store a variable to be referenced elsewhere.
    #We will want to store our processed data here so that it doesn't have to be processed on every page request
    set_transient('dfs_nba_stats', $result_arr, 60*60*48 );
    error_log("Executed NBA DFS cron job",0);
  }
}
