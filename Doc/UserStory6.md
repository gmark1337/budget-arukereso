# Feature: Multiple Languages 

Scenario: Languages can be set through the whole website
    Given the user can't speak English
    On the top left corner of the website there are 2 Language options 
    After successful switch the website langauage switches to the desired one

# Feature: Product details

Scenario: After search each product details can be viewed
    Given the user is on the main page 
    When the user enters the keyword and sets filtering up, starts the search
    After successful each product contains it's details more accurately