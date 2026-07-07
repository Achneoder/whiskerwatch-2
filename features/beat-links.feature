Feature: Linking beats to hexes and factions
  As a game master
  I want to link a beat to the hex it plays out at and the factions it touches
  So that I can see at a glance where each plot thread happens and who it involves

  Background:
    Given I open Whiskerwatch
    And I navigate to the "Adventure" screen

  Scenario: Linking a beat to a hex and a faction surfaces the link on Hex Map and Factions
    Given the GM opens "The granary raid" beat to edit
    When the GM links the beat to the "Bramblewatch" hex
    And the GM links the beat to the "The Gnawing Court" faction
    And the GM saves the beat
    And I navigate to the "Hex map" screen
    And the GM opens the "Bramblewatch" hex
    Then the GM should see "The granary raid" listed as a beat touching this hex
    When the GM closes the hex detail
    And I navigate to the "Factions" screen
    Then the GM should see "The granary raid" listed as a beat touching "The Gnawing Court"
