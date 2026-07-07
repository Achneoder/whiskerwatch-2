Feature: Live Session — hireling wages and loyalty saves
  As a game master running a session at the table
  I want to roll a hireling's loyalty save on the spot and settle up wages at
  the end of a session
  So that I can track morale and pay without breaking away from Live Session

  Background:
    Given I open Whiskerwatch
    And I start a live session

  Scenario: Tapping a hireling's loyalty pill rolls a 2d6 loyalty save
    When the GM rolls a loyalty save for "Oat"
    Then I should see a loyalty save result showing a pass or a fail

  Scenario: A party mouse has no loyalty pill to tap
    Then "Pip" should not show a loyalty pill

  Scenario: Pay Day lists hirelings with their wage and lets the GM mark them paid
    When the GM opens Pay Day
    Then Pay Day should show "Oat" owed "5p" and marked "Unpaid"
    When the GM marks "Oat" paid in Pay Day
    Then Pay Day should show "Oat" marked "Paid"

  Scenario: An unpaid hireling in Pay Day can be rolled for a loyalty check inline
    When the GM opens Pay Day
    And the GM rolls the inline loyalty check for "Oat" in Pay Day
    Then Pay Day should show a loyalty save result for "Oat"
