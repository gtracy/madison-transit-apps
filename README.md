madison-transit-apps
====================
Apps built on top of the Madison Transit API.

https://www.smsmybus.com

The app is currently deployed on AWS.

Applications
------------
* SMS
* Kiosk Displays
_To be ported from older implementation_
Simple browser-based views of stop traffic can be supported using a kiosk application. 
  * public/kiosk/  contains the static displays for Mother Fool's, Sector67 and Supranet
  * apps/kiosk/  contains the dynamic display generator that creates a kiosk for any two stops in the system

Dev/Build/Deploy
----------------
This repo is designed for AWS. It deploys a single NodeJS function to Lambda and reads/writes data from Dynamo. To run locally,

1. Run DynamoDB [locally](https://dev.to/risafj/get-dynamodb-local-up-and-running-in-3-minutes-with-docker-5ec6) via Docker or point to an AWS cloud region.
1. Create two two tables - SMS_subscriber (key:"subscriber") & Apps_request_log (key:"id")
1. Setup .env file in project directory
  * TWILIO_ACCOUNT_SID=xxx
  * TWILIO_AUTH_TOKEN=xxx
  * METRO_API_KEY=xxx   (go to https://api.smsmybus.com to request a dev key)
1. Run app locally - ```node app-local.js```
1. Run ngrok to create a public tunnel to the above Node app = ```ngrok http 3300```
1. Setup a Twilio number to point to the above ngrok link with /message on the end

To deploy... just push to AWS lambda with the AWS CLI.

---
Are you looking for the Madison Transit API instead? Check these out...
* [https://api.smsmybus.com](https://api.smsmybus.com)
* [https://github.com/gtracy/madison-transit-api-gtfs](https://github.com/gtracy/madison-transit-api-gtfs)

