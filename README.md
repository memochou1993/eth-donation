# send-eth

<a href="https://memochou1993.github.io/send-eth/" target="_blank" rel="noopener noreferrer"><img width="100" src="https://img.shields.io/badge/send-eth-blue" alt="send-eth"></a>

## Demo

<a href="https://memochou1993.github.io/send-eth/" target="_blank" rel="noopener noreferrer"><img src="./screenshot.png" alt="send-eth"></a>

## Development

Copy `.env.local.example` to `.env.local`.

```ENV
REACT_APP_COINBASE_API_URL=https://api.coinbase.com/v2
REACT_APP_ETHERSCAN_URL=https://etherscan.io
REACT_APP_GITHUB_USERNAME=<your-github-username>
REACT_APP_WALLET_ADDRESS=<your-wallet-address>
```

Install dependencies.

```BASH
npm ci
```

Start app.

```BASH
npm run start
```

## Deploy

Update `package.json`.

```JSON
{
  "homepage": "https://<your-github-username>.github.io/send-eth/"
}
```

Build app.

```BASH
npm run build
```

Deploy app.

```BASH
npm run deploy
```

## Contributors

<a href="https://github.com/memochou1993/send-eth/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=memochou1993/send-eth" />
</a>
