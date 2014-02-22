var Currency = require('./lib/currency');
var canadianDollar = 0.91;

var currency = new Currency(canadianDollar);
console.log('50 Canadian dollars equals this amount of US dollars:');
console.log(currency.CanadianToUS(50));

console.log('30 US dollars equals this amount of Canadian dollars:');
console.log(currency.UStoCanadian(30));