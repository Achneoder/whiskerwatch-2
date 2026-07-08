Feature: Quick-reference rules drawer
  As a game master running a session at the table
  I want a slide-out drawer of condensed Mausritter rules text
  So that I don't have to tab out to a PDF mid-session to check saves, conditions, or advancement

  Background:
    Given I open Whiskerwatch

  Scenario: Opening the rules drawer from Live Session
    And I start a live session
    When the GM opens the rules reference drawer
    Then the GM should see the rules reference drawer
    And the GM should see the "Saves" rules section
    And the GM should see the "Conditions" rules section
    When the GM closes the rules reference drawer
    Then the GM should not see the rules reference drawer

  Scenario: Opening the rules drawer from Generators
    When I navigate to the "Generators" screen
    And the GM opens the rules reference drawer
    Then the GM should see the rules reference drawer
    And the GM should see the "Advancement" rules section
    When the GM closes the rules reference drawer
    Then the GM should not see the rules reference drawer
