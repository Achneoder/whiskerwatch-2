Feature: The app loads
  As a game master
  I want the app to open reliably
  So that I can start managing my campaign with no setup

  Scenario: Opening Whiskerwatch shows the app shell
    Given I open Whiskerwatch
    Then I should see "Whiskerwatch" in the sidebar
    And I should see the "Overview" navigation entry
