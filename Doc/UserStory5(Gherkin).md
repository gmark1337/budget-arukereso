# Feature: Product details

Scenario: After search each product details can be viewed
    Given the user is on the main page 
    When the user enters the keyword and sets filtering up, starts the search
    After successful search the listed items details can be seen


# Feature: Refactor search system

Scenario: After search the search time is lower then 10 seconds
    Given the user is on the website
    The headless browser are already open in the background not waiting to be opened
    The search time is greatly reduced
