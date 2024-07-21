const exchangeRates = {};
const cryptoPrices = {};

// Fetch cryptocurrencies and currencies
async function fetchOptions() {
    try {
        // Fetch cryptocurrencies
        const cryptoResponse = await fetch('https://api.coingecko.com/api/v3/coins/list');
        const cryptoData = await cryptoResponse.json();
        const cryptoSelect = document.getElementById('crypto');
        cryptoSelect.innerHTML = ''; // Clear existing options
        cryptoData.forEach(crypto => {
            const option = document.createElement('option');
            option.value = crypto.id;
            option.textContent = crypto.name;
            cryptoSelect.appendChild(option);
        });

        // Fetch currencies
        const currencyResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const currencyData = await currencyResponse.json();
        const currencySelect = document.getElementById('currency');
        currencySelect.innerHTML = ''; // Clear existing options
        for (const currency in currencyData.rates) {
            const option = document.createElement('option');
            option.value = currency.toLowerCase();
            option.textContent = currency;
            currencySelect.appendChild(option);
        }
    } catch (error) {
        console.error('Error fetching options:', error);
    }
}

// Function to fetch exchange rates from an API
async function fetchExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        exchangeRates.usd = 1;
        for (const [currency, rate] of Object.entries(data.rates)) {
            exchangeRates[currency.toLowerCase()] = rate;
        }
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
    }
}

// Function to fetch cryptocurrency prices from an API
async function fetchCryptoPrices() {
    const selectedCrypto = document.getElementById('crypto').value;
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${selectedCrypto}&vs_currencies=usd`);
        const data = await response.json();
        cryptoPrices[selectedCrypto] = data[selectedCrypto].usd;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
    }
}

// Function to convert prices to selected currency
function convertPrice(price, fromCurrency, toCurrency) {
    return (price / exchangeRates[fromCurrency]) * exchangeRates[toCurrency];
}

async function startTrading() {
    await fetchExchangeRates();
    await fetchCryptoPrices();

    const crypto = document.getElementById('crypto').value;
    const currency = document.getElementById('currency').value;
    const buyPriceRange = document.getElementById('buyPriceRange').value;
    const buyTriggerPrice = parseFloat(document.getElementById('buyTriggerPrice').value);
    const sellPriceRange = document.getElementById('sellPriceRange').value;
    const sellTriggerPrice = parseFloat(document.getElementById('sellTriggerPrice').value);
    const startTime = document.getElementById('startTime').value;
    const stopTime = document.getElementById('stopTime').value;

    const [buyMin, buyMax] = buyPriceRange.split('-').map(price => convertPrice(parseFloat(price), currency, 'usd'));
    const [sellMin, sellMax] = sellPriceRange.split('-').map(price => convertPrice(parseFloat(price), currency, 'usd'));

    const convertedBuyTriggerPrice = convertPrice(buyTriggerPrice, currency, 'usd');
    const convertedSellTriggerPrice = convertPrice(sellTriggerPrice, currency, 'usd');

    console.log('Starting trading for', crypto);
    console.log('Buy Price Range:', buyMin, '-', buyMax, 'USD');
    console.log('Buy Trigger Price:', convertedBuyTriggerPrice, 'USD');
    console.log('Sell Price Range:', sellMin, '-', sellMax, 'USD');
    console.log('Sell Trigger Price:', convertedSellTriggerPrice, 'USD');
    console.log('Start Time:', startTime);
    console.log('Stop Time:', stopTime);

    // Here you would make an API call to your backend to start the trading bot
    // Example: fetch('/start-trading', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         crypto, 
    //         buyPriceRange: {min: buyMin, max: buyMax},
    //         buyTriggerPrice: convertedBuyTriggerPrice,
    //         sellPriceRange: {min: sellMin, max: sellMax},
    //         sellTriggerPrice: convertedSellTriggerPrice,
    //         startTime, stopTime
    //     })
    // });
}

function stopTrading() {
    console.log('Stopping trading');

    // Send a request to the backend to stop the trading bot
    // Example: fetch('/stop-trading', { method: 'POST' });
}

// Initial fetch of options
fetchOptions();

// Set up an interval to fetch updated crypto prices
setInterval(async () => {
    await fetchCryptoPrices();
    console.log('Current Prices:', cryptoPrices);
    // Here you would call checkPrices() if needed
}, 5000); // Check prices every 5 seconds