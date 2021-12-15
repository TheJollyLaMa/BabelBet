# Duolingo Peer Challenge Dapp with Web3 and Node on Polygon/Matic
Inspired by:
Unofficial Duolingo API Written in Python by KartikTalwar.
https://github.com/KartikTalwar/Duolingo#get-calendar
Using:
Unofficial Duolingo API for browser and NodeJs by acSpock
https://github.com/acSpock/duolingo-js



## BabelBet by TheJollyLaMa
BabelBet is a Decentralized Application (Dapp) leveraging Web3 and a smart contract in solidity to allow students of the Duolingo app to challenge each other to friendly wagers that make language training exciting by raising the stakes and involving friends in your journey!

### Installation
```sh
npm install
```

### Usage
for now, make sure you start local chain in ganache before firing up the local server
then:
```sh
npm run dev
```
local dev server started on localhost:8888
Developed using Chrome and Metamask so far so that's where you'll find your best experience.

Connect Metamask.
Initiate a challenge with another DuoLingo username and their email address in the browser form.
Enter your email and password to send an email to the duolingo student you want to challenge.
If they accept your terms, you will be notified by email and the challenge will begin.
If they make a counteroffer, you will be notified by email and given a chance to deny and counter or to accept the new terms.

The challenge will be observed by a watcher function that gets the challenge ids, duoinfo, and terms of each challenge
and executes payouts accordingly.
First (and currently only) challenge is for a Streak of days studying on duolingo.
This watcher will get duo stats on each player in the challenge's PlayerList and see if their Duo Streak is still going.
If it is, the staked amount stays staked.  If it's not, the player forfeits their stake to the players still maintaining streak.
Everytime a player drops out, a few dimes go to the payout made to all those who finish the streak.
Choose your streak choose your stake.

### Use Case Diagram
![Use Case Diagram](https://github.com/TheJollyLaMa/BabelBet/blob/41b6918efa809c1b135d583881f30ae4071735d3/Use_Case_Diagram.png)


#### ToDo's

finish up solidity contracts involving payouts
Make a better dashboard with funds sweep options


unit tests
E2E tests
Solidity tests
Watcher function
Codify more challenges
Creative DeFi link ups in the Dashboard
