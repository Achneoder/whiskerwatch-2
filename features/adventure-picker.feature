Feature: Live Session's adventure picker
  As a game master running two concurrent plot threads
  I want Live Session to ask which adventure I'm playing tonight when more than one has an active beat
  So that the table sees the right beat, hex, and encounter context instead of whichever one happened to be first in storage

  Background:
    Given I open Whiskerwatch
    And I navigate to the "Adventure" screen
    And the GM adds an active beat titled "Into the tunnels" to "The granary raid"
    And the GM adds an adventure titled "The Gnawing Court"
    And the GM adds an active beat titled "Confront the envoy" to "The Gnawing Court"
    And I start a live session

  Scenario: Two adventures each have an active beat, so a picker appears defaulted to the first
    Then I should see "The granary raid" in the adventure picker chip
    And I should see "Into the tunnels" as the active beat

  Scenario: The GM switches adventures mid-sitting and the beat updates to match
    When the GM opens the adventure picker
    Then I should see "Confront the envoy" as an option under "The Gnawing Court"
    When the GM picks "The Gnawing Court" from the adventure picker
    Then I should see "The Gnawing Court" in the adventure picker chip
    And I should see "Confront the envoy" as the active beat
