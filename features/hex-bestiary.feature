Feature: Hex encounters draw from the real Bestiary
  As a game master
  I want to link bestiary creatures to a hex with roll weights
  So that a rolled encounter resolves to a real stat block I can run at the table, not flavor text

  Background:
    Given I open Whiskerwatch

  Scenario: Linking a creature to a hex surfaces it on the map and in the encounter generator
    Given I navigate to the "Hex map" screen
    And the GM opens the "Bramblewatch" hex
    When the GM links the "Gnawing Court Ratling" creature to this hex with weight 3
    And the GM saves the hex
    And the GM opens the "Bramblewatch" hex
    Then the GM should see "Gnawing Court Ratling ×3" listed as an encounter here
    When the GM closes the hex detail
    And I navigate to the "Generators" screen
    And the GM selects the "Bramblewatch" hex in the encounter generator
    And the GM rolls an encounter
    Then the GM should see the "Gnawing Court Ratling" stat block

  Scenario: Deleting a linked bestiary entry removes the stale link from the hex
    Given I navigate to the "Hex map" screen
    And the GM opens the "Bramblewatch" hex
    When the GM links the "Gnawing Court Ratling" creature to this hex with weight 1
    And the GM saves the hex
    And I navigate to the "Bestiary" screen
    And the GM deletes the "Gnawing Court Ratling" bestiary entry
    And I navigate to the "Hex map" screen
    And the GM opens the "Bramblewatch" hex
    Then the GM should not see "Gnawing Court Ratling" listed as an encounter here
