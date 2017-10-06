<?php

defined( 'ABSPATH' ) or die( 'Error: Plugin cannot be called directly!' );

class DFS_NBA_Cron {
  public static function load_stats() {
    $result_arr = array();

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

    $result_arr[] = $testPlayer1;
    $result_arr[] = $testPlayer2;

    set_transient('dfs_nba_stats', $result_arr, 60*60*48 );
    error_log("Executed NBA DFS cron job",0);
  }
}
