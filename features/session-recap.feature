Feature: End-of-session recap draft
  As a game master wrapping up a table session
  I want Whiskerwatch to draft a session log entry from what happened during Live Session
  So that I don't have to reconstruct the sitting from memory afterward

  Background:
    Given I open Whiskerwatch
    And I start a live session

  Scenario: Ending the session offers a recap draft built from the sitting's facts
    When the GM applies 9 damage to "Wren"
    And the GM bumps "The Gnawing Court"'s faction clock
    And the GM ends the session
    Then I should see "Wren's STR drained to 1" in the recap checklist
    And I should see "The Gnawing Court clock" in the recap checklist
    When the GM drafts the recap
    Then the session summary field should contain "Wren's STR drained to 1"
    And the session summary field should contain "The Gnawing Court clock"

  Scenario: The GM can uncheck a fact so it's left out of the draft
    When the GM applies 9 damage to "Wren"
    And the GM bumps "The Gnawing Court"'s faction clock
    And the GM ends the session
    And the GM unchecks the recap fact "Wren's STR drained to 1"
    And the GM drafts the recap
    Then the session summary field should not contain "STR drained"
    And the session summary field should contain "The Gnawing Court clock"

  Scenario: The GM can edit the drafted summary before saving it to the session log
    When the GM applies 9 damage to "Wren"
    And the GM ends the session
    And the GM drafts the recap
    And the GM appends " The warband regrouped at the granary." to the session summary
    And the GM enters "Into the sewers, part two" as the session title
    And the GM saves the session
    Then I should see "Into the sewers, part two" in the session log
    And I should see "The warband regrouped at the granary." in the session log
