Feature: Live Session — burning item charges from a mouse's bag
  As a game master running a session at the table
  I want to tick down a chargeable item's wear track from Live Session
  So that I can track torches, potions, and wands burning out during play
  without breaking away to the Roster screen

  Background:
    Given I open Whiskerwatch
    And I navigate to the "Warband" screen
    And the GM opens "Pip" to edit
    And the GM adds "Lantern" with 3 charges to an empty inventory slot
    And the GM saves the mouse
    And I open Whiskerwatch
    And I start a live session

  Scenario: Tapping a chargeable item in the bag ticks its charge down with an undo toast
    When the GM opens "Pip"'s bag
    Then the bag should show "Lantern" with 3 of 3 charges
    When the GM taps "Lantern" in the bag
    Then the bag should show "Lantern" with 2 of 3 charges
    And I should see "Undo"
    When the GM undoes the charge
    Then the bag should show "Lantern" with 3 of 3 charges
