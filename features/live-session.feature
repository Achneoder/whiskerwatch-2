Feature: Live Session — Mausritter saves and Fatal Wounds
  As a game master running a session at the table
  I want Live Session to use Mausritter's real d20 roll-under saves and its
  deterministic Fatal Wounds rule
  So that the app teaches and enforces the right game, not a different one

  Background:
    Given I open Whiskerwatch
    And I start a live session

  Scenario: Rolling a save is a d20 roll-under check, not a 2d6 band
    When the GM rolls a save for "Pip" using "STR"
    Then I should see a save result showing a pass or a fail

  Scenario: A failed STR save marks a wounded mouse Injured and Incapacitated
    Given the GM has forced every roll to fail
    When the GM applies 9 damage to "Wren"
    And the GM rolls the pending STR save for "Wren"
    Then "Wren" should show the "Injured" condition
    And "Wren" should show the "Incapacitated" condition

  Scenario: STR hitting exactly 0 skips the save and asks for death confirmation
    When the GM applies 10 damage to "Wren"
    Then I should see "Confirm death?"
    When the GM confirms the death
    Then "Wren" should appear in the Fallen list
