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
    <div className="flex items-center h-screen dark:bg-slate-200 md:dark:bg-slate-800">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <figure className="flex flex-col px-16 py-16 text-center w-96 bg-slate-200 text-slate-600 rounded-xl">
            <div className="mb-6">
              <img className="mx-auto rounded-full w-36 h-36" src={`https://github.com/${REACT_APP_GITHUB_USERNAME}.png`} alt={REACT_APP_GITHUB_USERNAME} />
            </div>
            <div className="mb-6 text-lg tracking-wider">
              Buy
              {' '}
              <span className="font-bold text-slate-800">{REACT_APP_GITHUB_USERNAME}</span>
              {' '}
              a Beer
            </div>
            <div className="mt-4 mb-12">
              <div className="flex flex-row">
                <img className="w-8 h-8 mx-auto" src={beer} alt="beer" />
                <button type="button" className="w-12 rounded-l cursor-pointer bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-500" onClick={onMinus}>
                  <span className="m-auto text-2xl font-light">-</span>
                </button>
                <input type="number" className="w-12 text-center outline-none bg-slate-200 hover:bg-slate-300" value={count} min="1" max="100" onChange={onInput} />
                <button type="button" className="w-12 rounded-r cursor-pointer bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-500" onClick={onPlus}>
                  <span className="m-auto text-2xl font-light">+</span>
                </button>
              </div>
            </div>
            <div className="mb-6 text-xs text-slate-600">
              {`${amount.toLocaleString()} ${CURRENCY} ≈ ${(wei / 10 ** 18).toFixed(9)} ETH`}
            </div>
            <button type="button" className="mb-6 btn btn-gradient" onClick={onSend}>Donate ETH</button>
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
