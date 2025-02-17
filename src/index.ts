// Documentation: https://sdk.netlify.com
import { NetlifyExtension } from "@netlify/sdk";
import { makeConnectSettings } from "./schema/settings-schema";

//Declare the extension
const extension = new NetlifyExtension();
//Declare the connector
const connector = extension.addConnector({
  typePrefix: "Moneygram",
  supports: {
    connect: true,
    visualEditor: false,
  },
  defineOptions({ zod }) {
    return makeConnectSettings(zod);
  },
  localDevOptions: {
    numberOfMockItems: 5,
  },
  initState: async ({ options }) => {
    const client = new ProductApiClient();
    return {
      client,
    };
  },

});

//Dynamic Connector Code Goes HERE:




// Create API Client
class ProductApiClient {
  API: string;
  constructor() {
    this.API = `https://zingy-muffin-1f6fe5.netlify.app/.netlify/functions/getData`;
  }
  async getStores() {
    let apiUrl = this.API;
    const res = await fetch(apiUrl);
    const data = await res.json();
    return data;
  }

}

//Create Model
connector.model(async ({ define }) => {
  define.document({
    name: `PaymentOption`,
    fields: {
      contentId: { type: `string` },
      paymentOptionId: { type: `number` },
      displayOrder: { type: `number` },
      name: { type: `string` },
      localizedName: { type: `string` },
      defaultOption: { type: `boolean` },
      useForFx: { type: `boolean` },
      paymentOptionDisabled: { type: `boolean` },
      receiveGroups: {
        list: true,
        type: define.inlineObject({
          fields: {
            receiveGroupName: { type: `string` },
            receiveGroupLabel: { type: `string` },
            order: { type: `number` },
            receiveOptions: {
              list: true,
              type: define.inlineObject({
                fields: {
                  order: { type: `number` },
                  deliveryOptionId: { type: `number` },
                  description: { type: `string` },
                  localizedDescription: { type: `string` },
                  receiveCurrency: { type: `string` },
                  exchangeRate: { type: `float` },
                  exchangeRateEstimated: { type: `boolean` },
                  receiveAgentId: { type: `string` },
                  sendFees: { type: `float` },
                  totalNonDiscountedFees: { type: `float` },
                  sendTaxes: { type: `float` },
                  sendAmount: { type: `float` },
                  totalAmountToCollect: { type: `float` },
                  receiveFees: { type: `float` },
                  receiveFeesEstimated: { type: `boolean` },
                  receiveTaxes: { type: `float` },
                  receiveTaxesEstimated: { type: `boolean` },
                  receiveAmount: { type: `float` },
                  totalAmountToReceive: { type: `float` },
                  mgiTransactionSessionId: { type: `string` },
                  estimatedDeliveryDateLabel: { type: `string` },
                  estimatedDeliveryDate: { type: `string` },
                  receiveCountry: { type: `string` },
                  sendFeeTaxAmount: { type: `float` },
                  fxUnRevisedPricingDetails: {
                    type: define.inlineObject({
                      fields: {
                        unRevisedFxRate: { type: `float` },
                        unRevisedReceiveAmount: { type: `float` },
                        unRevisedSendAmount: { type: `float` },
                        unRevisedTotalSendFee: { type: `float` },
                      },
                    }),
                  },
                },
              }),
            },
            hideForNewTransaction: { type: `boolean` },
            overloadWithFastSend: { type: `boolean` },
          },
        }),
      },
    },
  });
});


//Sync your connector with API
connector.sync(async ({ models, state }) => {
  const data = await state.client.getStores({});
  console.log(`The payment option id is ${data.paymentOptions[0].paymentOptionId}`);

  data.paymentOptions.forEach((paymentOption: any) => {
    models.PaymentOption.insert({
      id: paymentOption.paymentOptionId,
      paymentOptionId: paymentOption.paymentOptionId,
      displayOrder: paymentOption.displayOrder,
      name: paymentOption.name,
      localizedName: paymentOption.localizedName,
      defaultOption: paymentOption.defaultOption,
      useForFx: paymentOption.useForFx,
      paymentOptionDisabled: paymentOption.paymentOptionDisabled,
      receiveGroups: paymentOption.receiveGroups.map((group: any) => ({
        receiveGroupName: group.receiveGroupName,
        receiveGroupLabel: group.receiveGroupLabel,
        order: group.order,
        receiveOptions: group.receiveOptions.map((option: any) => ({
          order: option.order,
          deliveryOptionId: option.deliveryOptionId,
          description: option.description,
          localizedDescription: option.localizedDescription,
          receiveCurrency: option.receiveCurrency,
          exchangeRate: option.exchangeRate,
          exchangeRateEstimated: option.exchangeRateEstimated,
          receiveAgentId: option.receiveAgentId,
          sendFees: option.sendFees,
          totalNonDiscountedFees: option.totalNonDiscountedFees,
          sendTaxes: option.sendTaxes,
          sendAmount: option.sendAmount,
          totalAmountToCollect: option.totalAmountToCollect,
          receiveFees: option.receiveFees,
          receiveFeesEstimated: option.receiveFeesEstimated,
          receiveTaxes: option.receiveTaxes,
          receiveTaxesEstimated: option.receiveTaxesEstimated,
          receiveAmount: option.receiveAmount,
          totalAmountToReceive: option.totalAmountToReceive,
          mgiTransactionSessionId: option.mgiTransactionSessionId,
          estimatedDeliveryDateLabel: option.estimatedDeliveryDateLabel,
          estimatedDeliveryDate: option.estimatedDeliveryDate,
          receiveCountry: option.receiveCountry,
          sendFeeTaxAmount: option.sendFeeTaxAmount,
          fxUnRevisedPricingDetails: option.fxUnRevisedPricingDetails ? {
            unRevisedFxRate: option.fxUnRevisedPricingDetails.unRevisedFxRate,
            unRevisedReceiveAmount: option.fxUnRevisedPricingDetails.unRevisedReceiveAmount,
            unRevisedSendAmount: option.fxUnRevisedPricingDetails.unRevisedSendAmount,
            unRevisedTotalSendFee: option.fxUnRevisedPricingDetails.unRevisedTotalSendFee,
          } : undefined,
        })),
        hideForNewTransaction: group.hideForNewTransaction,
        overloadWithFastSend: group.overloadWithFastSend,
      })),
      _createdAt: new Date().toISOString(),
      _status: `published`,
      contentId: paymentOption.paymentOptionId,
    });
  });
});

export { extension };
