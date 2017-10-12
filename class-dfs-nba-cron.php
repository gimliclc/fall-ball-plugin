<?php

defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

class DFS_NBA_Cron {
  public static function load_stats() {
    // create separate arrays for home and away to be accessed later
    // using the Fanduel data to push to final result_arr
    $home_result_arr = array();
    $away_result_arr = array();
    $result_arr = array();
    $dvp_arr = array();

    // create function to scrape DvP pages
    function dvp_scrape($dvp_url){
      //create array to hold dvp object
      $dvp_scraped = array();
      $dvp_url_to_scrape = $dvp_url;
      $dvp_url_response = file_get_contents($dvp_url_to_scrape);
      $dvp_dom = new DOMDocument();
      libxml_use_internal_errors(true);
      $dvp_dom->loadHTML($dvp_url_response);
      $dvp_xpath = new DOMXpath($dvp_dom);
      $td_query = ".//td";
      $dvp_row_query = "//*/div/table/tbody/tr";
      $dvp_rows_result = $dvp_xpath->query($dvp_row_query);
      foreach($dvp_rows_result as $row){
        $dvp_tds = $dvp_xpath->query($td_query, $row);
        $teamNameNode = $dvp_tds->item(0);
        $vsPos = $dvp_tds->item(1);
        $season_dvp = $dvp_tds->item(2);
        $last_five_dvp = $dvp_tds->item(3);
        $last_ten_dvp = $dvp_tds->item(4);
        // Avoids wayback machine text
        if (strpos($teamNameNode->nodeValue, 'captures') !== false){}
        // Checks to make sure response is alphanumeric (avoids blanks)
        elseif(preg_match("/[a-z]/i", $teamNameNode->nodeValue)){
          $dvp_obj = array(
            "name" => $teamNameNode->nodeValue,
            "vsPos" => $vsPos->nodeValue,
            "season_dvp" => $season_dvp->nodeValue,
            "last_five_dvp" => $last_five_dvp->nodeValue,
            "last_ten_dvp" => $last_ten_dvp->nodeValue
          );
          $dvp_scraped[] = $dvp_obj;
        }
        else {}
      }
      return $dvp_scraped;
    }
    // Adjust URLs once season begins
    $dvp_pg = dvp_scrape('https://web.archive.org/web/20170310152146/http://www.rotowire.com/daily/nba/defense-vspos.php?site=FanDuel&astatview=season&pos=PG');
    $dvp_sg = dvp_scrape('https://web.archive.org/web/20170311074055/http://www.rotowire.com:80/daily/nba/defense-vspos.php?site=FanDuel&statview=season&pos=SG');
    $dvp_sf = dvp_scrape('https://web.archive.org/web/20170311074050/http://www.rotowire.com:80/daily/nba/defense-vspos.php?site=FanDuel&statview=season&pos=SF');
    $dvp_pf = dvp_scrape('https://web.archive.org/web/20170311074044/http://www.rotowire.com:80/daily/nba/defense-vspos.php?site=FanDuel&statview=season&pos=PF');
    $dvp_c = dvp_scrape('https://web.archive.org/web/20170311074029/http://www.rotowire.com:80/daily/nba/defense-vspos.php?site=FanDuel&statview=season&pos=C');
    // Push scraped data to DvP array
    array_push($dvp_arr,$dvp_pg,$dvp_sg,$dvp_sf,$dvp_pf,$dvp_c);
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
        "gp" => (int)$home_player_tds->item(3)->nodeValue,
        "minutes" => (int)$home_player_tds->item(4)->nodeValue,
        "field_goals" => (int)$home_player_tds->item(5)->nodeValue,
        "three_pointers" => (int)$home_player_tds->item(8)->nodeValue,
        "free_throws" => (int)$home_player_tds->item(11)->nodeValue,
        "rebounds" => (int)$home_player_tds->item(18)->nodeValue,
        "assists" => (int)$home_player_tds->item(19)->nodeValue,
        "steals" => (int)$home_player_tds->item(20)->nodeValue,
        "blocks" => (int)$home_player_tds->item(21)->nodeValue,
        "turnovers" => $home_player_tds->item(14)->nodeValue
      );
      $home_scraped[] = $home_player_obj;

    }
    return $home_scraped;
  }
    $home_result_1 = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/Home");
    $home_result_2 = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/2/Home");
    $home_result_3 = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/3/Home");
    $home_result_4 = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/4/Home");
    $home_result_5 = home_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/5/Home");
    array_push($home_result_arr,$home_result_1,$home_result_2,$home_result_3,$home_result_4,$home_result_5);
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
    $away_result_1 = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/1/away");
    $away_result_2 = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/2/away");
    $away_result_3 = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/3/away");
    $away_result_4 = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/4/away");
    $away_result_5 = away_load_stats("https://basketball.realgm.com/nba/stats/2017/Averages/All/points/All/desc/5/away");
    array_push($away_result_arr,$away_result_1,$away_result_2,$away_result_3,$away_result_4,$away_result_5);
    // create function to handle scraping of CSVs
    function load_csvs($csv_to_scrape) {
      $csv_arr = array();
      $openFile = fopen($csv_to_scrape, 'r');
      if($openFile){
      while (($line = fgetcsv($openFile)) !== FALSE) {
        if ($line[0] == ""){}
        elseif ($line[0] == "playerID") {}
        else {
          $csv_arr[] = $line;
        }
      }

      fclose($openFile);
      } else {
        error_log("Unable to open file!", 0);
      }
      return $csv_arr;
    }
    // load csvs to the $result_arr
    $fd_result_arr = load_csvs(DFS_NBA_DIR . 'Fanduel.csv');
    $dk_result_arr = load_csvs(DFS_NBA_DIR . 'Draftkings.csv');
    $y_result_arr = load_csvs(DFS_NBA_DIR . 'Yahoo.csv');
    // Create function to search through arrays
    // Have to use multiple arrays to store scraped data
    function selectById($array, $data) {
    foreach($array as $row) {
       if($row['playerID'] == $data) {
         return $row;
       }
    }
    return ("X");
    }
    // Create function to search through FD array to return a different error code
    function selectByFdId($array, $data) {
    foreach($array as $row) {
       if($row[0] == $data) {
         return $row;
       }
    }
    return ("No");
    }
    // Create function to search through Y array to return a different error code
    function selectByYahooId($array, $data) {
    foreach($array as $row) {
       if($row[0] == $data) {
         return $row;
       }
    }
    return ("N");
    }
    // Scrape DK CSV for player data.  Players found here will be the core
    // which will be compared against both FD and Yahoo
    foreach ($dk_result_arr as $player){
      $found_fd_player = selectByFdId($fd_result_arr, $player[0]);
      $found_yahoo_player = selectByYahooId($y_result_arr, $player[0]);
          if ($player[1] == "Home") {
              $found_player = selectById($home_result_arr[0], $player[0]);
              if ($found_player == "X"){
                $found_player = selectById($home_result_arr[1], $player[0]);
                if ($found_player == "X"){
                  $found_player = selectById($home_result_arr[2], $player[0]);
                  if ($found_player == "X"){
                    $found_player = selectById($home_result_arr[3], $player[0]);
                    if ($found_player == "X"){
                      $found_player = selectById($home_result_arr[4], $player[0]);
                    }
                  }
                }
              }
              // Combine info from home scrape, Yahoo csv DK csv and FD csv
              if ($found_yahoo_player == "N"){
                if ($found_fd_player == "No"){
                  // IF no Yahoo, FD or Home
                  if ($found_player == "X"){
                    $found_home_player_obj = array(
                      "playerID" => $player[0],
                      "homeaway" => $player[1],
                      "dk_name" => $player[2],
                      "dk_position" => $player[3],
                      "dk_price" => $player[5],
                      "game_info" => $player[6],
                      "dk_fppg" => $player[7],
                      "team" => $player[8],
                      "minutes" => "",
                      "field_goals" => "",
                      "three_pointers" => "",
                      "free_throws" => "",
                      "rebounds" => "",
                      "assists" => "",
                      "steals" => "",
                      "blocks" => "",
                      "turnovers" => "",
                      "fd_position" => "",
                      "fd_fppg" => "",
                      "fd_price" => "",
                      "injured" => "",
                      "injured note" => "",
                      "y_position" => "",
                      "y_fppg" => "",
                      "y_price" => ""
                    );
                  }
                  else {
                    // If no FD or Yahoo
                    $found_home_player_obj = array(
                      "playerID" => $player[0],
                      "homeaway" => $player[1],
                      "dk_name" => $player[2],
                      "dk_position" => $player[3],
                      "dk_price" => $player[5],
                      "game_info" => $player[6],
                      "dk_fppg" => $player[7],
                      "team" => $player[8],
                      "minutes" => $found_player['minutes'],
                      "field_goals" => $found_player['field_goals'],
                      "three_pointers" => $found_player['three_pointers'],
                      "free_throws" => $found_player['free_throws'],
                      "rebounds" => $found_player['rebounds'],
                      "assists" => $found_player['assists'],
                      "steals" => $found_player['steals'],
                      "blocks" => $found_player['blocks'],
                      "turnovers" => $found_player['turnovers'],
                      "fd_position" => "",
                      "fd_fppg" => "",
                      "fd_price" => "",
                      "opponent" => "",
                      "injured" => "",
                      "injured note" => "",
                      "y_position" => "",
                      "y_fppg" => "",
                      "y_price" => ""
                    );
                  }
              }
              else {
                if ($found_player == "X"){
                  // If no Home or Yahoo
                  $found_home_player_obj = array(
                    "playerID" => $player[0],
                    "homeaway" => $player[1],
                    "dk_name" => $player[2],
                    "dk_position" => $player[3],
                    "dk_price" => $player[5],
                    "game_info" => $player[6],
                    "dk_fppg" => $player[7],
                    "team" => $player[8],
                    "minutes" => "",
                    "field_goals" => "",
                    "three_pointers" => "",
                    "free_throws" => "",
                    "rebounds" => "",
                    "assists" => "",
                    "steals" => "",
                    "blocks" => "",
                    "turnovers" => "",
                    "fd_position" => $found_fd_player[4],
                    "fd_fppg" => $found_fd_player[8],
                    "fd_price" => $found_fd_player[10],
                    "opponent" => $found_fd_player[13],
                    "injured" => $found_fd_player[14],
                    "injured note" => $found_fd_player[15],
                    "y_position" => "",
                    "y_fppg" => "",
                    "y_price" => ""
                  );
                }
                else{
                  // If no Yahoo
                  $found_home_player_obj = array(
                    "playerID" => $player[0],
                    "homeaway" => $player[1],
                    "dk_name" => $player[2],
                    "dk_position" => $player[3],
                    "dk_price" => $player[5],
                    "game_info" => $player[6],
                    "dk_fppg" => $player[7],
                    "team" => $player[8],
                    "minutes" => $found_player['minutes'],
                    "field_goals" => $found_player['field_goals'],
                    "three_pointers" => $found_player['three_pointers'],
                    "free_throws" => $found_player['free_throws'],
                    "rebounds" => $found_player['rebounds'],
                    "assists" => $found_player['assists'],
                    "steals" => $found_player['steals'],
                    "blocks" => $found_player['blocks'],
                    "turnovers" => $found_player['turnovers'],
                    "fd_position" => $found_fd_player[4],
                    "fd_fppg" => $found_fd_player[8],
                    "fd_price" => $found_fd_player[10],
                    "opponent" => $found_fd_player[13],
                    "injured" => $found_fd_player[14],
                    "injured note" => $found_fd_player[15],
                    "y_position" => "",
                    "y_fppg" => "",
                    "y_price" => ""
                  );
                }
              }
            }
              else {
                if ($found_fd_player == "No"){
                  if ($found_player == "X"){
                    // If Yahoo and DK, no FD or Home
                    $found_home_player_obj = array(
                      "playerID" => $player[0],
                      "homeaway" => $player[1],
                      "dk_name" => $player[2],
                      "dk_position" => $player[3],
                      "dk_price" => $player[5],
                      "game_info" => $player[6],
                      "dk_fppg" => $player[7],
                      "team" => $player[8],
                      "minutes" => "",
                      "field_goals" => "",
                      "three_pointers" => "",
                      "free_throws" => "",
                      "rebounds" => "",
                      "assists" => "",
                      "steals" => "",
                      "blocks" => "",
                      "turnovers" => "",
                      "fd_position" => "",
                      "fd_fppg" => "",
                      "fd_price" => "",
                      "opponent" => "",
                      "injured" => "",
                      "injured note" => "",
                      "y_position" => $found_yahoo_player[6],
                      "y_fppg" => $found_yahoo_player[12],
                      "y_price" => $found_yahoo_player[11]
                );
              }
              // If Yahoo, DK, Home and no FD
              else {
                $found_home_player_obj = array(
                  "playerID" => $player[0],
                  "homeaway" => $player[1],
                  "dk_name" => $player[2],
                  "dk_position" => $player[3],
                  "dk_price" => $player[5],
                  "game_info" => $player[6],
                  "dk_fppg" => $player[7],
                  "team" => $player[8],
                  "minutes" => $found_player['minutes'],
                  "field_goals" => $found_player['field_goals'],
                  "three_pointers" => $found_player['three_pointers'],
                  "free_throws" => $found_player['free_throws'],
                  "rebounds" => $found_player['rebounds'],
                  "assists" => $found_player['assists'],
                  "steals" => $found_player['steals'],
                  "blocks" => $found_player['blocks'],
                  "turnovers" => $found_player['turnovers'],
                  "fd_position" => "",
                  "fd_fppg" => "",
                  "fd_price" => "",
                  "opponent" => "",
                  "injured" => "",
                  "injured note" => "",
                  "y_position" => $found_yahoo_player[6],
                  "y_fppg" => $found_yahoo_player[12],
                  "y_price" => $found_yahoo_player[11]
            );
              }
            }
            else {
              // If Yahoo, FD, DK no home
              if ($found_player == "X"){
                $found_home_player_obj = array(
                  "playerID" => $player[0],
                  "homeaway" => $player[1],
                  "dk_name" => $player[2],
                  "dk_position" => $player[3],
                  "dk_price" => $player[5],
                  "game_info" => $player[6],
                  "dk_fppg" => $player[7],
                  "team" => $player[8],
                  "minutes" => "",
                  "field_goals" => "",
                  "three_pointers" => "",
                  "free_throws" => "",
                  "rebounds" => "",
                  "assists" => "",
                  "steals" => "",
                  "blocks" => "",
                  "turnovers" => "",
                  "fd_position" => $found_fd_player[4],
                  "fd_fppg" => $found_fd_player[8],
                  "fd_price" => $found_fd_player[10],
                  "opponent" => $found_fd_player[13],
                  "injured" => $found_fd_player[14],
                  "injured note" => $found_fd_player[15],
                  "y_position" => $found_yahoo_player[6],
                  "y_fppg" => $found_yahoo_player[12],
                  "y_price" => $found_yahoo_player[11]
                );
              }
              else {
                // If Yahoo, DK, FD and Home ** Found All **
                $found_home_player_obj = array(
                  "playerID" => $player[0],
                  "homeaway" => $player[1],
                  "dk_name" => $player[2],
                  "dk_position" => $player[3],
                  "dk_price" => $player[5],
                  "game_info" => $player[6],
                  "dk_fppg" => $player[7],
                  "team" => $player[8],
                  "minutes" => $found_player['minutes'],
                  "field_goals" => $found_player['field_goals'],
                  "three_pointers" => $found_player['three_pointers'],
                  "free_throws" => $found_player['free_throws'],
                  "rebounds" => $found_player['rebounds'],
                  "assists" => $found_player['assists'],
                  "steals" => $found_player['steals'],
                  "blocks" => $found_player['blocks'],
                  "turnovers" => $found_player['turnovers'],
                  "fd_position" => $found_fd_player[4],
                  "fd_fppg" => $found_fd_player[8],
                  "fd_price" => $found_fd_player[10],
                  "opponent" => $found_fd_player[13],
                  "injured" => $found_fd_player[14],
                  "injured note" => $found_fd_player[15],
                  "y_position" => $found_yahoo_player[6],
                  "y_fppg" => $found_yahoo_player[12],
                  "y_price" => $found_yahoo_player[11]
                );
                }
            }
          }
            // Store in a FD array to be added to the DK data
            $result_arr[] = $found_home_player_obj;
          }
          else {
            $found_player = selectById($away_result_arr[0], $player[0]);
            if ($found_player == "X"){
              $found_player = selectById($away_result_arr[1], $player[0]);
              if ($found_player == "X"){
                $found_player = selectById($away_result_arr[2], $player[0]);
                if ($found_player == "X"){
                  $found_player = selectById($away_result_arr[3], $player[0]);
                  if ($found_player == "X"){
                    $found_player = selectById($away_result_arr[4], $player[0]);
                  }
                }
              }
            }
            // Combine info from home scrape, Yahoo csv DK csv and FD csv
            if ($found_yahoo_player == "N"){
              if ($found_fd_player == "No"){
                // IF no Yahoo, FD or Home
                if ($found_player == "X"){
                  $found_away_player_obj = array(
                    "playerID" => $player[0],
                    "homeaway" => $player[1],
                    "dk_name" => $player[2],
                    "dk_position" => $player[3],
                    "dk_price" => $player[5],
                    "game_info" => $player[6],
                    "dk_fppg" => $player[7],
                    "team" => $player[8],
                    "minutes" => "",
                    "field_goals" => "",
                    "three_pointers" => "",
                    "free_throws" => "",
                    "rebounds" => "",
                    "assists" => "",
                    "steals" => "",
                    "blocks" => "",
                    "turnovers" => "",
                    "fd_position" => "",
                    "fd_fppg" => "",
                    "fd_price" => "",
                    "injured" => "",
                    "injured note" => "",
                    "y_position" => "",
                    "y_fppg" => "",
                    "y_price" => ""
                  );
                }
                else {
                  // If no FD or Yahoo
                  $found_away_player_obj = array(
                    "playerID" => $player[0],
                    "homeaway" => $player[1],
                    "dk_name" => $player[2],
                    "dk_position" => $player[3],
                    "dk_price" => $player[5],
                    "game_info" => $player[6],
                    "dk_fppg" => $player[7],
                    "team" => $player[8],
                    "minutes" => $found_player['minutes'],
                    "field_goals" => $found_player['field_goals'],
                    "three_pointers" => $found_player['three_pointers'],
                    "free_throws" => $found_player['free_throws'],
                    "rebounds" => $found_player['rebounds'],
                    "assists" => $found_player['assists'],
                    "steals" => $found_player['steals'],
                    "blocks" => $found_player['blocks'],
                    "turnovers" => $found_player['turnovers'],
                    "fd_position" => "",
                    "fd_fppg" => "",
                    "fd_price" => "",
                    "opponent" => "",
                    "injured" => "",
                    "injured note" => "",
                    "y_position" => "",
                    "y_fppg" => "",
                    "y_price" => ""
                  );
                }
            }
            else {
              if ($found_player == "X"){
                // If no Home or Yahoo
                $found_away_player_obj = array(
                  "playerID" => $player[0],
                  "homeaway" => $player[1],
                  "dk_name" => $player[2],
                  "dk_position" => $player[3],
                  "dk_price" => $player[5],
                  "game_info" => $player[6],
                  "dk_fppg" => $player[7],
                  "team" => $player[8],
                  "minutes" => "",
                  "field_goals" => "",
                  "three_pointers" => "",
                  "free_throws" => "",
                  "rebounds" => "",
                  "assists" => "",
                  "steals" => "",
                  "blocks" => "",
                  "turnovers" => "",
                  "fd_position" => $found_fd_player[4],
                  "fd_fppg" => $found_fd_player[8],
                  "fd_price" => $found_fd_player[10],
                  "opponent" => $found_fd_player[13],
                  "injured" => $found_fd_player[14],
                  "injured note" => $found_fd_player[15],
                  "y_position" => "",
                  "y_fppg" => "",
                  "y_price" => ""
                );
              }
              else{
                // If no Yahoo
                $found_away_player_obj = array(
                  "playerID" => $player[0],
                  "homeaway" => $player[1],
                  "dk_name" => $player[2],
                  "dk_position" => $player[3],
                  "dk_price" => $player[5],
                  "game_info" => $player[6],
                  "dk_fppg" => $player[7],
                  "team" => $player[8],
                  "minutes" => $found_player['minutes'],
                  "field_goals" => $found_player['field_goals'],
                  "three_pointers" => $found_player['three_pointers'],
                  "free_throws" => $found_player['free_throws'],
                  "rebounds" => $found_player['rebounds'],
                  "assists" => $found_player['assists'],
                  "steals" => $found_player['steals'],
                  "blocks" => $found_player['blocks'],
                  "turnovers" => $found_player['turnovers'],
                  "fd_position" => $found_fd_player[4],
                  "fd_fppg" => $found_fd_player[8],
                  "fd_price" => $found_fd_player[10],
                  "opponent" => $found_fd_player[13],
                  "injured" => $found_fd_player[14],
                  "injured note" => $found_fd_player[15],
                  "y_position" => "",
                  "y_fppg" => "",
                  "y_price" => ""
                );
              }
            }
          }
            else {
              if ($found_fd_player == "No"){
                if ($found_player == "X"){
                  // If Yahoo and DK, no FD or Home
                  $found_away_player_obj = array(
                    "playerID" => $player[0],
                    "homeaway" => $player[1],
                    "dk_name" => $player[2],
                    "dk_position" => $player[3],
                    "dk_price" => $player[5],
                    "game_info" => $player[6],
                    "dk_fppg" => $player[7],
                    "team" => $player[8],
                    "minutes" => "",
                    "field_goals" => "",
                    "three_pointers" => "",
                    "free_throws" => "",
                    "rebounds" => "",
                    "assists" => "",
                    "steals" => "",
                    "blocks" => "",
                    "turnovers" => "",
                    "fd_position" => "",
                    "fd_fppg" => "",
                    "fd_price" => "",
                    "opponent" => "",
                    "injured" => "",
                    "injured note" => "",
                    "y_position" => $found_yahoo_player[6],
                    "y_fppg" => $found_yahoo_player[12],
                    "y_price" => $found_yahoo_player[11]
              );
            }
            // If Yahoo, DK, Home and no FD
            else {
              $found_away_player_obj = array(
                "playerID" => $player[0],
                "homeaway" => $player[1],
                "dk_name" => $player[2],
                "dk_position" => $player[3],
                "dk_price" => $player[5],
                "game_info" => $player[6],
                "dk_fppg" => $player[7],
                "team" => $player[8],
                "minutes" => $found_player['minutes'],
                "field_goals" => $found_player['field_goals'],
                "three_pointers" => $found_player['three_pointers'],
                "free_throws" => $found_player['free_throws'],
                "rebounds" => $found_player['rebounds'],
                "assists" => $found_player['assists'],
                "steals" => $found_player['steals'],
                "blocks" => $found_player['blocks'],
                "turnovers" => $found_player['turnovers'],
                "fd_position" => "",
                "fd_fppg" => "",
                "fd_price" => "",
                "opponent" => "",
                "injured" => "",
                "injured note" => "",
                "y_position" => $found_yahoo_player[6],
                "y_fppg" => $found_yahoo_player[12],
                "y_price" => $found_yahoo_player[11]
          );
            }
          }
          else {
            // If Yahoo, FD, DK no home
            if ($found_player == "X"){
              $found_away_player_obj = array(
                "playerID" => $player[0],
                "homeaway" => $player[1],
                "dk_name" => $player[2],
                "dk_position" => $player[3],
                "dk_price" => $player[5],
                "game_info" => $player[6],
                "dk_fppg" => $player[7],
                "team" => $player[8],
                "minutes" => "",
                "field_goals" => "",
                "three_pointers" => "",
                "free_throws" => "",
                "rebounds" => "",
                "assists" => "",
                "steals" => "",
                "blocks" => "",
                "turnovers" => "",
                "fd_position" => $found_fd_player[4],
                "fd_fppg" => $found_fd_player[8],
                "fd_price" => $found_fd_player[10],
                "opponent" => $found_fd_player[13],
                "injured" => $found_fd_player[14],
                "injured note" => $found_fd_player[15],
                "y_position" => $found_yahoo_player[6],
                "y_fppg" => $found_yahoo_player[12],
                "y_price" => $found_yahoo_player[11]
              );
            }
            else {
              // If Yahoo, DK, FD and Home ** Found All **
              $found_away_player_obj = array(
                "playerID" => $player[0],
                "homeaway" => $player[1],
                "dk_name" => $player[2],
                "dk_position" => $player[3],
                "dk_price" => $player[5],
                "game_info" => $player[6],
                "dk_fppg" => $player[7],
                "team" => $player[8],
                "minutes" => $found_player['minutes'],
                "field_goals" => $found_player['field_goals'],
                "three_pointers" => $found_player['three_pointers'],
                "free_throws" => $found_player['free_throws'],
                "rebounds" => $found_player['rebounds'],
                "assists" => $found_player['assists'],
                "steals" => $found_player['steals'],
                "blocks" => $found_player['blocks'],
                "turnovers" => $found_player['turnovers'],
                "fd_position" => $found_fd_player[4],
                "fd_fppg" => $found_fd_player[8],
                "fd_price" => $found_fd_player[10],
                "opponent" => $found_fd_player[13],
                "injured" => $found_fd_player[14],
                "injured note" => $found_fd_player[15],
                "y_position" => $found_yahoo_player[6],
                "y_fppg" => $found_yahoo_player[12],
                "y_price" => $found_yahoo_player[11]
              );
              }
          }
        }
          // Store in a FD array to be added to the DK data
          $result_arr[] = $found_away_player_obj;
        }
        }
    #Wordpress transients allow us to temporarily store a variable to be referenced elsewhere.
    #We will want to store our processed data here so that it doesn't have to be processed on every page request
    set_transient('dfs_nba_stats', $result_arr, 60*60*48 );
    set_transient('dfs_nba_dvp', $dvp_arr, 60*60*48 );
    error_log("Executed NBA DFS cron job",0);
  }
}
