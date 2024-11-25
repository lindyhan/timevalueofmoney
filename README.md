# Time Value Of Money

This is an app where travellers book hotel rooms in advance and earn yield from the Ethena staking contract from the time of payment to the time of check-in. This duration is the time value of money. I'm using travel bookings as an example, though this concept can equally apply to anything that people pay for in advance but only use after a period of time, like facial packages, course fees etc. The amount of yield earned is a function of the total amount paid (the higher the better) and the time gap in between payment and use (the longer the better).


https://github.com/user-attachments/assets/ffe5d46a-4026-4e1a-a052-34106b322461




---

In terminal, run
```
yarn start
```
In browser, go to http://localhost:3000/

---
# Flow

##### End user pays USDe to book hotel room
![image](https://github.com/user-attachments/assets/717c412e-9ce1-4485-b933-65d3020267b0)

##### This USDe is sent to Ethena Staking Contract
##### sUSDe is minted and sent to hotel owner / travel agency (the one who payment is due to)
##### Yield is being generated in the period between hotel room payment (stake) and actual hotel stay (unstake)

![image](https://github.com/user-attachments/assets/adcf791b-6b48-4e2a-97b8-fd991226615d)

![image](https://github.com/user-attachments/assets/f99f9cb5-cf20-49c0-83ae-e6ebfe341d4a)

##### At check in date, the buyer can collect his yield

![image](https://github.com/user-attachments/assets/8eb6e15a-6de3-4535-b1b5-3fb3e0c21af0)

##### The sUSDe is sent from the hotel/agency to Ethena Staking Contract
![image](https://github.com/user-attachments/assets/66ddc741-46f2-42bb-a572-2bfcdd3904ba)

##### USDe (original staked USDe + extra USDe from yield) is released to the hotel/agency
![image](https://github.com/user-attachments/assets/25a439fe-1619-4791-a320-24c1f4463088)

##### Hotel/agency keeps the payment for the room (original USDe payment) and sends the USDe from the yield to the client as a cashback reward

##### Or, just keep as additional profit.

---
Future developments: Apply this concept to any other business that collects payment in advance and delivers product/service later. The time in between can and should be monetized. Time Value Of Money.



