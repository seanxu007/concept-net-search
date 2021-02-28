# concept-net-search

## Description
Utilising ConceptNet (github.com/commonsense/conceptnet5/wiki/API), create an hierarchical JSON structure with all the term’s English language parent (IsA) concepts. The parent-child hierarchy should be ordered from the most general concept to the most specific.
I use NodeJs to finish this assignment. The task is to first find out all parent concepts of user input, then tried to create a JSON structure from general to specific using these parent concepts.

There are 3 steps for this search:

 1. Search all parent concepts of user input;
 2. Create isaRelation object by recursive searching the parent concepts' children from step 1(use maxDeep and weightLimit to throttle the request, only recurse maxDeep times for search and ignore the concept whose weight is too low);
 3. Order the parent concepts from step1 by using the isaRelation object from step 2 (recursive create the response);

Step Examples:

1. Enter "supreme court" and find out the parent concepts {"court:", "federal_court:", "appeals_court:"};
2. Create IsaRelation object: {"court": ["federal_court", "appeals_court", ...], "federal_court": {"supreme_court", ...}...};
3. Create the response: {"court": {"federal_court": {"supreme_court": {}}...}...};


I used "axios" as the HTTP request library, "mocha" and "chai" for testing.

 - `yarn start` to start the server, enter the term want to search and get back the response
 - `yarn test` to run the test
