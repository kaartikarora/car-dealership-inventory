# AI Interaction Log

**Date:** 2026-10-25  
**Tool:** Claude (via Claude Code CLI)  
**Context:** Raw, unedited prompts used during the day-long TDD build for the Car Dealership Kata.

1. i need to build a full stack car dealership inventory system for a coding kata. backend node express postgres prisma, frontend react tailwind vite. needs auth and admin roles. just map out the db schema and api routes first
2. looks good let's start the backend. we have to use strict TDD. set up jest and write a failing test for user registration and login first. dont write the implementation yet
3. cool tests are failing. go ahead and implement the auth logic to make them pass. use jwt and hash the passwords
4. now for vehicles. need protected routes for crud and search. admins can do everything, regular users just view and search. write failing tests first then the routes
5. need inventory logic. make a purchase endpoint to lower stock and fail if 0, and a restock endpoint for admins. tests first then build it
6. wait the search is acting weird if i type a % sign its messing with the db. also i spammed the register endpoint and it throws a 500 instead of 400 for duplicate emails. write regression tests for these and fix
7. alright backend is good. spin up the react frontend. just a simple login and dashboard showing the cars. add search and a purchase button that disables if stock is 0
8. add a quick admin view to add edit delete cars. doesnt need to be fancy just make it look decent with tailwind
9. ui has some weird global styles hiding the dialog titles, fix the tailwind classes on the modal
10. everything works. generate a TEST_REPORT.md from the jest output and a SECURITY.md. ill write the readme myself