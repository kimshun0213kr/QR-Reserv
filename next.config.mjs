/** @type {import('next').NextConfig} */
let http = "http"
if(process.env.NODE_ENV == "production"){
  http = "https"
}

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/getReserveData',
        destination: http+"://"+process.env.NEXT_PUBLIC_API_DOMAIN+"/api/getReserveData",
      },
      {
        source: '/api/setAlreadyBuy',
        destination:http+"://"+process.env.NEXT_PUBLIC_API_DOMAIN+"/api/setAlreadyBuy",
      },
      {
        source: '/api/getGoods',
        destination:http+"://"+process.env.NEXT_PUBLIC_API_DOMAIN+"/api/getGoods",
      },
      {
        source: '/api/setReserve',
        destination:http+"://"+process.env.NEXT_PUBLIC_API_DOMAIN+"/api/setReserve"
      },
    ]
  },
};

export default nextConfig;
