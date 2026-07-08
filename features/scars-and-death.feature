Feature: Scars & death ledger
  As a game master
  I want to narrate permanent scars on my mice and record how a mouse died
  So that Fatal Wounds leave a lasting, table-visible mark on the campaign

  Background:
    Given I open Whiskerwatch

  Scenario: The GM narrates a scar on a living mouse from the Roster
    When I navigate to the "Warband" screen
    And the GM adds a scar to "Pip" labeled "Lost an eye"
    Then "Pip" should show the "Lost an eye" scar

  Scenario: A death with a cause shows up in the roster's Fallen section and on the Timeline
    When I start a live session
    And the GM applies 10 damage to "Wren"
    And the GM confirms the death with the cause "Overrun by the barn cat's claws"
    And the GM exits the live session
    And I navigate to the "Warband" screen
    Then "Wren" should appear in the Fallen list
    When I navigate to the "Timeline" screen
    Then I should see "Wren died — Overrun by the barn cat's claws" in the timeline
