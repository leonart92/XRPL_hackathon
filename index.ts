import { ammService } from "./services/amm.service";
import { xrplService } from "./services/xrpl.service";

await xrplService.connect("mainnet");

const tx = await ammService.withdraw({
  account: "rM7cHVPfhe9yxQNk2kDNBEQqoQmMcQGPWE",
  asset: { currency: "XRP" },
  asset2: { currency: "USD", issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B" },
  lpTokenIn: {
    currency: "039C99CD9AB0B70B32ECDA51EAAE471625608EA2",
    issuer: "rE54zDvgnghAoPopCgvtiqWNq3dU5y836S",
    value: "50",
  },
});

console.log(tx);

await xrplService.disconnect();
