export const config = {
  port: process.env.PORT || 8000,
  local: {
    time: process.env.LOCAL_TIME || true,
    exchangeInfo: process.env.LOCAL_EXCHANGEINFO || true
  },
  fees: {
    maker: process.env.FEES_MAKER ? parseFloat(process.env.FEES_MAKER) : 0.001,
    taker: process.env.FEES_TAKER ? parseFloat(process.env.FEES_TAKER) : 0.001,
  }
}
