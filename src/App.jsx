import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import useError from './hooks/useError';
import beer from './beer.png';
import './App.css';
import {
  CURRENCY,
  BEER_PRICE,
  MIN_COUNT,
  MAX_COUNT,
  GAS_LIMIT,
  GAS_PRICE,
} from './constants';

const {
  REACT_APP_COINBASE_API_URL,
  REACT_APP_ETHERSCAN_URL,
  REACT_APP_WALLET_ADDRESS,
  REACT_APP_GITHUB_USERNAME,
} = process.env;

const { ethereum } = window;

function App() {
  const [error, setError] = useError('');
  const [rates, setRates] = useState([]);
  const [count, setCount] = useState('1');
  const [txHash, setTxHash] = useState('');

  const amount = useMemo(() => BEER_PRICE * Number(count), [count]);
  const wei = useMemo(() => Math.round(((amount / Number(rates[CURRENCY])) * 10 ** 18)), [rates, amount]);

  const fetchRates = () => new Promise((res, rej) => {
    axios.get(`${REACT_APP_COINBASE_API_URL}/exchange-rates`, { params: { currency: 'ETH' } })
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
    if (navigator.userAgentData.mobile) {
      window.location.href = `https://metamask.app.link/sned/${REACT_APP_WALLET_ADDRESS}@1?value=${wei.toExponential()}`;
      return;
    }
    try {
      const [from] = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: REACT_APP_WALLET_ADDRESS,
            gas: GAS_LIMIT.toString(16),
            gasPrice: GAS_PRICE.toString(16),
            value: wei.toString(16),
          },
        ],
      });
      setError('');
      setTxHash(txHash);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="h-screen flex items-center dark:bg-slate-800">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <figure className="w-96 flex flex-col text-center bg-slate-200 text-slate-600 rounded-xl px-16 py-16">
            <div className="mb-6">
              <img className="w-36 h-36 rounded-full mx-auto" src={`https://github.com/${REACT_APP_GITHUB_USERNAME}.png`} alt={REACT_APP_GITHUB_USERNAME} />
            </div>
            <div className="tracking-wider text-lg mb-6">
              Buy
              {' '}
              <span className="text-slate-800 font-bold">{REACT_APP_GITHUB_USERNAME}</span>
              {' '}
              a Beer
            </div>
            <div className="mt-4 mb-12">
              <div className="flex flex-row">
                <img className="w-8 h-8 mx-auto" src={beer} alt="beer" />
                <button type="button" className="bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-500 w-12 rounded-l cursor-pointer" onClick={onMinus}>
                  <span className="m-auto text-2xl font-light">-</span>
                </button>
                <input type="number" className="bg-slate-200 hover:bg-slate-300 w-12 text-center outline-none" value={count} min="1" max="100" onChange={onInput} />
                <button type="button" className="bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-500 w-12 rounded-r cursor-pointer" onClick={onPlus}>
                  <span className="m-auto text-2xl font-light">+</span>
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-600 mb-6">
              {`${amount.toLocaleString()} ${CURRENCY} ≈ ${(wei / 10 ** 18).toFixed(9)} ETH`}
            </div>
            <button type="button" className="btn btn-gradient mb-6" onClick={onSend}>Send ETH</button>
            <div className="text-xs text-slate-600">
              {!ethereum && (
                <>
                  <a target="_blank" href="https://metamask.io/download/" rel="noopener noreferrer">MetaMask</a>
                  {' '}
                  is not installed.
                </>
              )}
              {error}
              {txHash && (
                <>
                  Transaction Hash:
                  {' '}
                  <a target="_blank" href={`${REACT_APP_ETHERSCAN_URL}/tx/${txHash}`} rel="noopener noreferrer">
                    {txHash.substring(0, 5)}
                    ...
                    {txHash.substring(txHash.length - 4)}
                  </a>
                </>
              )}
            </div>
          </figure>
        </div>
      </div>
    </div>
  );
}

export default App;
