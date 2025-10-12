# SBTC MakerGun - Quick Start Guide

## 🤖 What is SBTC MakerGun?

SBTC MakerGun is an automated market making bot that trades between:
- **CEX (Binance)**: STXBTC trading pair
- **DEX (Bitflow Finance)**: SBTC/STX liquidity pool

The bot performs arbitrage trading to capture profit margins between centralized and decentralized exchanges.

## 🚀 Quick Start

### 1. Access the Control Panel

Navigate to **SBTC MakerGun** in the sidebar menu or go to `/makergun/sbtc`

### 2. Configure the Bot

Set your trading parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| Sell Amount | SBTC to sell per trade | 0.01 |
| Buy Amount | STX to use for buying | 100 |
| Sell Profit Margin | Target profit % when selling SBTC | 0.5% |
| Buy Profit Margin | Target profit % when buying SBTC | 0.5% |
| Sell Fee | Trading fee for sell operations | 0.1% |
| Buy Fee | Trading fee for buy operations | 0.1% |

### 3. Select Trading Mode

- **Mode 0 (Normal)**: Standard operation
- **Mode 1 (DeFi -1)**: Submit DEX tx 1 tick early
- **Mode 2 (DeFi -2)**: Submit DEX tx 2 ticks early  
- **Mode 3 (CEX Priority)**: Place CEX orders first ⭐ Recommended

### 4. Enable Strategies

Toggle the switches:
- ✅ **Sell Switch**: Enable SBTC → STX trading
- ✅ **Buy Switch**: Enable STX → SBTC trading
- ✅ **Balance Check**: Verify balance before trading

### 5. Start Trading

Click **"Start Bot"** to begin automated trading. The bot will:
1. Monitor DEX prices from Bitflow Finance
2. Calculate optimal entry points
3. Place limit orders on Binance
4. Execute DEX transactions when CEX orders fill
5. Complete arbitrage cycles

## 📊 Monitor Status

The status card shows:
- 🟢 **Running** / 🔴 **Stopped** indicator
- Current configuration values
- Real-time updates via WebSocket

## 🎯 Manual Trading

Use the manual order panel for quick trades:
1. Enter amount
2. Choose position:
   - **Position 0**: Sell SBTC for STX
   - **Position 1**: Buy SBTC with STX
3. Click submit

## ⚙️ Configuration Examples

### Conservative Strategy
```json
{
  "sellamount": 0.005,
  "buyamount": 50,
  "up": 1.0,
  "down": 1.0,
  "model": 3,
  "check_balance": true
}
```

### Aggressive Strategy
```json
{
  "sellamount": 0.02,
  "buyamount": 200,
  "up": 0.3,
  "down": 0.3,
  "model": 3,
  "check_balance": true
}
```

### Sell-Only Strategy
```json
{
  "sellamount": 0.01,
  "buyamount": 100,
  "sellswitch": true,
  "buyswitch": false,
  "model": 3
}
```

## 🔧 Troubleshooting

### Bot Won't Start
- ✅ Check all required fields are filled
- ✅ Verify backend server is running
- ✅ Check sufficient balance (if enabled)
- ✅ Review browser console for errors

### WebSocket Not Connecting
- ✅ Check backend WebSocket endpoint is available
- ✅ Verify VITE_BASE_API in .env is correct
- ✅ Check firewall/proxy settings
- ✅ Try refreshing the page

### Orders Not Executing
- ✅ Check Binance API credentials in backend
- ✅ Verify Stacks wallet is connected
- ✅ Check DEX liquidity availability
- ✅ Review backend logs for errors

## 📚 Advanced Usage

For detailed documentation, see:
- [SBTC_MAKERGUN_FRONTEND.md](./SBTC_MAKERGUN_FRONTEND.md) - Complete frontend documentation
- Backend documentation in `@mumugogoing/gin-web-dev` repository

## 🔐 Security Notes

- Bot requires USER role or higher
- All API calls are authenticated
- Private keys are stored securely in backend
- WebSocket connections are monitored for security

## 💡 Best Practices

1. **Start Small**: Test with minimal amounts first
2. **Monitor Activity**: Watch the first few trades closely
3. **Set Realistic Margins**: Account for fees and slippage
4. **Use Balance Check**: Prevent insufficient balance errors
5. **CEX Priority Mode**: Most reliable for production use

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review backend logs
- Test API endpoints directly
- Open an issue on GitHub

## 📄 License

Part of the web-bot-react project - see main repository for license details.
