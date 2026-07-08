Feature: Collapsing completed adventures
  As a game master with several adventures under my belt
  I want completed adventures to collapse out of the way
  So that the Adventure screen stays focused on the plot threads still live

  Background:
    Given I open Whiskerwatch
    And I navigate to the "Adventure" screen

  Scenario: A completed adventure collapses into a "Completed (N)" section
    Given the GM adds a completed adventure titled "The owl hunt"
    Then I should see "Completed (1)"
    When the GM expands the completed adventures section
    Then I should see "The owl hunt"
