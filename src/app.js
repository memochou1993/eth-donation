const MY_ADDRESS = '';
const CURRENCY = 'TWD';
const BASE_AMOUNT = 100;
const MIN_COUNT = 1;
const MAX_COUNT = 100;
const GAS = 30000;
const GAS_PRICE = 1500000000;

class App {
  constructor() {
    this.avatar = document.getElementById('avatar');
    this.username = document.getElementById('username');
    this.rate = document.getElementById('rate');
    this.message = document.getElementById('message');
    this.countInput = document.getElementById('count');
    this.minusButton = document.getElementById('minus');
    this.plusButton = document.getElementById('plus');
    this.sendButton = document.getElementById('send');
    this.rates = [];
    this.count = 1;
    this.value = 0;

    this.countInput.addEventListener('input', (e) => this.onCountInputChange(e));
    this.minusButton.addEventListener('click', () => this.onMinusButtonClick());
    this.plusButton.addEventListener('click', () => this.onPlusButtonClick());
    this.sendButton.addEventListener('click', () => this.onSendButtonClick());

    this.init();
  }

  async init() {
    if (!window.ethereum) {
      this.message.innerHTML = '<a target="_blank" href="https://metamask.io/download/" rel="noopener noreferrer">MetaMask</a> is not installed.';
    }
    if (window.location.host.includes('.github.io')) {
      const subject = window.location.host.replace('.github.io', '');
      this.avatar.src = `https://github.com/${subject}.png`;
      this.avatar.alt = subject;
      this.username.textContent = subject;
    }
    this.rates = await this.constructor.fetchRates();
    this.calculate();
  }

  calculate() {
    const totalAmount = BASE_AMOUNT * this.count;
    this.value = Math.round(((totalAmount / Number(this.rates[CURRENCY])) * 10 ** 18));
    this.rate.textContent = `${totalAmount.toLocaleString()} ${CURRENCY} ≈ ${(this.value / 10 ** 18).toFixed(9)} ETH`;
  }

  reset() {
    this.count = MIN_COUNT;
    this.value = 0;
    this.countInput.value = MIN_COUNT;
    this.calculate();
  }

  static fetchRates() {
    return new Promise((resolve, reject) => {
      fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH')
        .then((r) => r.json())
        .then(({ data }) => resolve(data.rates))
        .catch((err) => reject(err));
    });
  }

  onCountInputChange(e) {
    const count = Number(e.target.value);
    if (count > MAX_COUNT) {
      this.countInput.value = MAX_COUNT;
      this.count = MAX_COUNT;
      this.calculate();
      return;
    }
    if (count < MIN_COUNT) {
      this.countInput.value = MIN_COUNT;
      this.count = MIN_COUNT;
      this.calculate();
      return;
    }
    this.count = count;
    this.calculate();
  }

  onMinusButtonClick() {
    if (this.count > MIN_COUNT) {
      this.count -= 1;
      this.countInput.value = this.count;
      this.calculate();
    }
  }

  onPlusButtonClick() {
    if (this.count < MAX_COUNT) {
      this.count += 1;
      this.countInput.value = this.count;
      this.calculate();
    }
  }

  async onSendButtonClick() {
    try {
      const [from] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: MY_ADDRESS,
            gas: GAS.toString(16),
            gasPrice: GAS_PRICE.toString(16),
            value: this.value.toString(16),
          },
        ],
      });
      this.reset();
      this.message.innerHTML = `Transaction Hash: <a target="_blank" href="https://rinkeby.etherscan.io/tx/${txHash}" rel="noopener noreferrer">${txHash.substring(0, 5)}...${txHash.substring(txHash.length - 4)}</a>`;
    } catch (err) {
      this.message.textContent = err.message;
    }
  }
}

window.onload = () => new App();
