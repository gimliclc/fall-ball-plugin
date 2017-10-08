<?php

defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

class DFS_NBA_Cron {
  public static function load_stats() {
    // create separate arrays for home and away to be accessed later
    // using the Fanduel data to push to final result_arr
    $home_result_arr = array();
    $away_result_arr = array();
    $result_arr = array();

    // create function to scrape home stats pages
    function home_load_stats($url_to_scrape){
    $home_scraped = array();
    $home_stats_url = $url_to_scrape;
    $home_stats_response = file_get_contents($home_stats_url);
    $home_dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $home_dom->loadHTML($home_stats_response);
    // Lets you search for specific elements using xpath
		$home_xpath = new DOMXPath($home_dom);
    // Use xpath to search for all tr elements and save to result rows
    $td_query = ".//td";
    $a_query = ".//a";
    $home_player_query = "//tr";
    $home_result_rows = $home_xpath ->query($home_player_query);
    foreach ($home_result_rows as $home_player){
      $home_player_tds = $home_xpath->query($td_query, $home_player);
      $playerNameNode = $home_player_tds->item(1);
      $playerNameLinkNode = $home_xpath->query($a_query, $playerNameNode);
      $findPlayerId = $playerNameLinkNode->item(0)->getAttribute('href');
      if($playerNameLinkNode->item(0)->getAttribute('href') == "/"){
        continue;
      }
      if(preg_match("/\/(\d+)$/",$findPlayerId,$matches))
      {
        $playerID=$matches[1];
      }
        else
        {
          error_log("No player ID found for home_player");
        }
      $home_player_obj = array(
        "playerID" => $playerID,
        "name" => $playerNameLinkNode->item(0)->nodeValue,
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
      $home_scraped[] = $home_player_obj;

    }
    return $home_scraped;
  }
    $home_result_arr[] = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/Home");
    $home_result_arr[] = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/2/Home");
    $home_result_arr[] = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/3/Home");
    $home_result_arr[] = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/4/Home");
    $home_result_arr[] = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/5/Home");

    // create function to process away stats pages
    function away_load_stats($url_to_scrape){
    $away_scraped = array();
    $away_stats_url = $url_to_scrape;
    $away_stats_response = file_get_contents($away_stats_url);
    $away_dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $away_dom->loadHTML($away_stats_response);
    // Lets you search for specific elements using xpath
		$away_xpath = new DOMXPath($away_dom);
    // Use xpath to search for all tr elements and save to result rows
    $td_query = ".//td";
    $a_query = ".//a";
    $away_player_query = "//tr";
    $away_result_rows = $away_xpath ->query($away_player_query);
    foreach ($away_result_rows as $away_player){
      $away_player_tds = $away_xpath->query($td_query, $away_player);
      $playerNameNode = $away_player_tds->item(1);
      $playerNameLinkNode = $away_xpath->query($a_query, $playerNameNode);
      $findPlayerId = $playerNameLinkNode->item(0)->getAttribute('href');
      if($playerNameLinkNode->item(0)->getAttribute('href') == "/"){
        continue;
      }
      if(preg_match("/\/(\d+)$/",$findPlayerId,$matches))
      {
        $playerID=$matches[1];
      }
        else
        {
          error_log("No player ID found for home_player");
        }
      $away_player_obj = array(
        "playerID" => $playerID,
        "name" => $playerNameLinkNode->item(0)->nodeValue,
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
      $away_scraped[] = $away_player_obj;

    }
    return $away_scraped;
  }
    $away_result_arr[] = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/away");
    $away_result_arr[] = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/2/away");
    $away_result_arr[] = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/3/away");
    $away_result_arr[] = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/4/away");
    $away_result_arr[] = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/5/away");
    // create function to handle scraping of CSVs
    function load_csvs($csv_to_scrape) {
      $csv_arr = array();
      $openFile = fopen($csv_to_scrape, 'r');
      while (($line = fgetcsv($openFile)) !== FALSE) {
        if ($line[0] == ""){}
        elseif ($line[0] == "playerID") {}
        else {
          $csv_arr[] = $line;
        }
      }
      fclose($openFile);
      return $csv_arr;
    }
    // load csvs to the $result_arr
    // Need to figure out how to reference the files without full path!
    $fd_result_arr = load_csvs('C:\wamp\www\fta\wp-content\plugins\fall-ball-plugin\Fanduel.csv');
    $dk_result_arr = load_csvs('C:\wamp\www\fta\wp-content\plugins\fall-ball-plugin\Draftkings.csv');
    $y_result_arr = load_csvs('C:\wamp\www\fta\wp-content\plugins\fall-ball-plugin\Yahoo.csv');
    //This extracts playerID from array $home_result_arr[0][0]['playerID']
    $result_arr[] = $fd_result_arr[0][0];
    // Create function to search through arrays
    // FIRST page of arr results comes in fine. Need to figure out why other pages dont
    function selectById($array, $data) {
    foreach($array as $row) {
       if($row['playerID'] == $data) {
         return $row['name'];
       }
    }
    return ("Didn't find " . $data);
    }
    // Set up for loop to match playerID to home or away stats
    foreach ($fd_result_arr as $player){
        if ($player[1] == "Home") {
            $found_player = selectById($home_result_arr[0], $player[0]);
            error_log($found_player);
        }
        else {
          $found_player = selectById($away_result_arr[0], $player[0]);
          error_log($found_player);
        }
      }
    #Wordpress transients allow us to temporarily store a variable to be referenced elsewhere.
    #We will want to store our processed data here so that it doesn't have to be processed on every page request
    set_transient('dfs_nba_stats', $result_arr, 60*60*48 );
    error_log("Executed NBA DFS cron job",0);
  }
}
