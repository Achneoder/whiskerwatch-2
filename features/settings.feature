Feature: Settings
  As a game master
  I want a settings screen
  So that I can back up my campaign, and adjust theme and language, in one place

  Scenario: A new user is told their data lives only in this browser
    Given I open Whiskerwatch
    When I navigate to the "Settings" screen
    Then I should see "Your campaign lives only in this browser."
    And I should see "Campaign data"

  Scenario: Switching the language updates the whole interface
    Given I open Whiskerwatch
    When I navigate to the "Settings" screen
    And I switch the language to German
    Then I should see "Einstellungen"
    And I should see the "Übersicht" navigation entry

  Scenario: Switching the theme takes effect immediately
    Given I open Whiskerwatch
    When I navigate to the "Settings" screen
    And I switch the theme to dark
    Then the app uses the "dark" theme

  Scenario: Importing a campaign asks for confirmation first
    Given I open Whiskerwatch
    When I navigate to the "Settings" screen
    And I choose an invalid file to import
    Then I should see "Replace campaign data?"

  Scenario: A reset button is available to start over
    Given I open Whiskerwatch
    When I navigate to the "Settings" screen
    Then I should see "Reset everything"
    And I should see "Clear all campaign data and start fresh"
