Feature: Hexes link to factions as territory
  As a game master
  I want to mark a hex as controlled or contested by factions
  So that I can glance at the map and see whose territory the party is walking into

  Background:
    Given I open Whiskerwatch
    And I navigate to the "Hex map" screen

  Scenario: Marking a hex as controlled by a faction shows a Controlled by tag
    Given the GM opens the "Bramblewatch" hex
    When the GM sets the controlling faction to "The Gnawing Court"
    And the GM saves the hex
    And the GM opens the "Bramblewatch" hex
    Then the GM should see "The Gnawing Court" listed as the controlling faction

  Scenario: Marking a hex as contested by two factions shows both as contesting
    Given the GM opens the "Bramblewatch" hex
    When the GM adds "The Gnawing Court" as a contesting faction
    And the GM adds "The Seed-Keepers" as a contesting faction
    And the GM saves the hex
    And the GM opens the "Bramblewatch" hex
    Then the GM should see "The Gnawing Court" listed as a contesting faction
    And the GM should see "The Seed-Keepers" listed as a contesting faction
