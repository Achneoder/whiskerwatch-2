Feature: Generated NPCs are keepable
  As a game master
  I want to save a rolled NPC into the Roster or the Bestiary
  So that a good improvised NPC survives past the next roll instead of vanishing

  Background:
    Given I open Whiskerwatch
    And I navigate to the "Generators" screen

  Scenario: Saving a rolled NPC to the Roster makes them findable as a hireling later
    When the GM rolls an NPC
    And the GM saves the rolled NPC to the Roster
    Then the GM should see a "Saved to Roster" button
    When I navigate to the "Warband" screen
    Then the GM should see the rolled NPC listed among the hirelings

  Scenario: Saving a rolled NPC to the Bestiary makes them findable as a Humanoid entry later
    When the GM rolls an NPC
    And the GM saves the rolled NPC to the Bestiary
    Then the GM should see a "Saved to Bestiary" button
    When I navigate to the "Bestiary" screen
    Then the GM should see the rolled NPC listed in the bestiary

  Scenario: Undoing a roster save removes the hireling again
    When the GM rolls an NPC
    And the GM saves the rolled NPC to the Roster
    And the GM undoes the last generator action
    Then the GM should see a "Save to Roster" button
    When I navigate to the "Warband" screen
    Then the GM should not see the rolled NPC listed among the hirelings
