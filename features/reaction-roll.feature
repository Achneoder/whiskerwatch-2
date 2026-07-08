Feature: Reaction rolls and retainer limits
  As a game master running Mausritter
  I want a quick 2d6 reaction roll for an encountered creature, and a heads-up
  when my hirelings outnumber what my mice can command
  So that I can improvise NPC attitudes at the table and know when Loyalty
  checks are likely to get messy

  Background:
    Given I open Whiskerwatch

  Scenario: Rolling a reaction for a freshly-rolled encounter in Generators
    When I navigate to the "Generators" screen
    And the GM rolls an encounter
    And the GM rolls a reaction for the encounter
    Then I should see a reaction result showing a band and its guidance sentence

  Scenario: Rolling a new encounter clears the previous reaction result
    When I navigate to the "Generators" screen
    And the GM rolls an encounter
    And the GM rolls a reaction for the encounter
    And the GM rolls an encounter
    Then the "Roll Reaction" button should be visible again with no reaction result showing

  Scenario: Roster warns when hirelings outnumber what the warband's mice can command
    When I navigate to the "Warband" screen
    Then the GM should not see the hireling limit warning
    When the GM removes every mouse from the warband
    Then the GM should see the hireling limit warning
    When the GM adds a mouse named "Juniper" to the warband
    Then the GM should not see the hireling limit warning
