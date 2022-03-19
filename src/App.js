import { useState, useEffect } from 'react';
import axios from 'axios';
import beer from './beer.png';
import './App.css';

const WALLET_ADDRESS = '0x72E6c9390ea3B34bFfD534128Cb86afD66B0ae02';
const CURRENCY = 'TWD';
const COINBASE_API_URL = 'https://api.coinbase.com/v2';
const ETHERSCAN_URL = 'https://rinkeby.etherscan.io';
const BASE_AMOUNT = 100;
const MIN_COUNT = 1;
const MAX_COUNT = 100;
const GAS = 30000;
const GAS_PRICE = 1500000000;

const { ethereum } = window;

function App() {
  const [rates, setRates] = useState([]);
  const [count, setCount] = useState('1');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const totalAmount = () => BASE_AMOUNT * Number(count);
  const value = () => Math.round(((totalAmount() / Number(rates[CURRENCY])) * 10 ** 18));

  const fetchRates = () => new Promise((res, rej) => {
    axios.get(`${COINBASE_API_URL}/exchange-rates`, { params: { currency: 'ETH' } })
      .then(({ data }) => res(data.data.rates))
      .catch((e) => rej(e));
  });

  useEffect(async () => {
    setRates(await fetchRates());
  }, []);

  const onInput = (e) => {
    const count = Number(e.target.value);
    if (count > MAX_COUNT) {
      setCount(String(MAX_COUNT));
      return;
    }
    if (count < MIN_COUNT) {
      setCount(String(MIN_COUNT));
      return;
    }
    setCount(String(count));
  };

  const onMinus = () => {
    if (Number(count) > MIN_COUNT) {
      setCount(String(Number(count) - 1));
    }
  };

  const onPlus = () => {
    if (Number(count) < MAX_COUNT) {
      setCount(String(Number(count) + 1));
    }
  };

  const onSend = async () => {
    try {
      const [from] = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: WALLET_ADDRESS,
            gas: GAS.toString(16),
            gasPrice: GAS_PRICE.toString(16),
            value: value().toString(16),
          },
        ],
      });
      setTxHash(txHash);
    } catch (e) {
      setError(e.message);
    }
  };

  // FIXME
  const Message = () => {
    if (!ethereum) {
      return (
        <>
          <a target="_blank" href="https://metamask.io/download/" rel="noopener noreferrer">MetaMask</a>
          {' '}
          is not installed.
        </>
      );
    }
    if (error) {
      return `${error}`;
    }
    if (txHash) {
      return (
        <>
          Transaction Hash:
          {' '}
          <a target="_blank" href={`${ETHERSCAN_URL}/tx/${txHash}`} rel="noopener noreferrer">
            {txHash.substring(0, 5)}
            ...
            {txHash.substring(txHash.length - 4)}
          </a>
        </>
      );
    }
    return <>&nbsp;</>;
  };

  return (
    <div className="h-screen flex items-center dark:bg-slate-800">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <figure className="w-96 flex flex-col text-center bg-slate-200 text-slate-600 rounded-xl px-16 py-16">
            <div className="mb-6">
              <img id="avatar" className="w-36 h-36 rounded-full mx-auto" src="https://github.githubassets.com/images/mona-loading-dark.gif" alt="me" />
            </div>
            <div className="tracking-wider text-lg mb-6">
              Buy
              {' '}
              <span id="username" className="text-slate-800 font-bold">me</span>
              {' '}
              a Beer
            </div>
            <div className="mt-4 mb-12">
              <div className="flex flex-row">
                <img className="w-8 h-8 mx-auto" src={beer} alt="beer" />
                <button type="button" id="minus" className="bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-500 w-12 rounded-l cursor-pointer" onClick={onMinus}>
                  <span className="m-auto text-2xl font-light">-</span>
                </button>
                <input id="count" type="number" className="bg-slate-200 hover:bg-slate-300 w-12 text-center outline-none" value={count} min="1" max="100" onChange={onInput} />
                <button type="button" id="plus" className="bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-500 w-12 rounded-r cursor-pointer" onClick={onPlus}>
                  <span className="m-auto text-2xl font-light">+</span>
                </button>
              </div>
            </div>
            <div id="rate" className="text-xs text-slate-600 mb-6">
              { `${totalAmount().toLocaleString()} ${CURRENCY} ≈ ${(value() / 10 ** 18).toFixed(9)} ETH` }
            </div>
            <button type="button" id="send" className="btn btn-gradient mb-6" onClick={onSend}>Send ETH</button>
            <div className="text-xs text-slate-600">
              <Message />
            </div>
          </figure>
        </div>
      </div>
    </div>
  );
}

export default App;
