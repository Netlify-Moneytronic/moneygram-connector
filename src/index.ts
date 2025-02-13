// Documentation: https://sdk.netlify.com
import { NetlifyExtension } from "@netlify/sdk";
import { makeConnectSettings } from "./schema/settings-schema";

//Declare the extension
const extension = new NetlifyExtension();
//Declare the connector
const connector = extension.addConnector({
  typePrefix: "Stores",
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
    this.API = `https://fakestoreapi.com/products`;
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
      paymentOptionId: { type: `number` },
      displayOrder: { type: `number` },
      name: { type: `string` },
      localizedName: { type: `string` },
      defaultOption: { type: `boolean` },
      useForFx: { type: `boolean` },
      paymentOptionDisabled: { type: `boolean` },
      receiveGroups: {
        type: `list`,
        of: {
          type: `object`,
          fields: {
            receiveGroupName: { type: `string` },
            receiveGroupLabel: { type: `string` },
            order: { type: `number` },
            receiveOptions: {
              type: `list`,
              of: {
                type: `object`,
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
                    type: `object`,
                    fields: {
                      unRevisedFxRate: { type: `float` },
                      unRevisedReceiveAmount: { type: `float` },
                      unRevisedSendAmount: { type: `float` },
                      unRevisedTotalSendFee: { type: `float` },
                    },
                  },
                },
              },
            },
            hideForNewTransaction: { type: `boolean` },
            overloadWithFastSend: { type: `boolean` },
          },
        },
      },
    },
  });
});


let productIds: string[] = [];

//Sync your connector with API
connector.sync(async ({ models, state }) => {
  const currentProductIds: string[] = []
  const data = await state.client.getStores({});
  data.forEach((product: { id: any; }) => {
    currentProductIds.push(product.id)
    models.Product.insert({
      ...product,
      _createdAt: new Date().toISOString(),
      _status: `published`,
      contentId: product.id,
    });
  });

  productIds.forEach(id => { if (!currentProductIds.includes(id)) { models.Product.delete(id) } })

  productIds = currentProductIds;
});

export { extension };