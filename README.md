npm install 
node server.js

1. Updating Express App for Production

npm install pm2 -g
pm2 start server.js --name "CreditCardPayoffPDFServer"
pm2 save
pm2 startup