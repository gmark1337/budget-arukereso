# Feature: Product details

**Scenario:** After search each product details can be viewed <br>
    Given the user is on the main page <br> 
    When the user enters the keyword and sets filtering up, starts the search<br>
    After successful search the listed items details can be seen


# Feature: Refactor search system

**Scenario:** After search the search time is lower then 10 seconds<br>
    Given the user is on the website<br>
    The headless browser are already open in the background not waiting to be opened<br>
    The search time is greatly reduced
