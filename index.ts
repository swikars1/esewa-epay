import axios, { AxiosInstance } from "axios";

/**
 * Wraps a Promise in a try/catch block, returning a tuple for robust error handling.
 *
 * @template T - The expected data type of the resolved Promise.
 * @param promise - The Promise to be wrapped.
 * @returns A tuple of `[data, error]` where:
 *    - `data` is the resolved data of the Promise (or null on error).
 *    - `error` is the error object if the Promise rejected (or null on success).
 */
async function awTry<T>(promise: unknown) {
  try {
    const data = await promise;
    return [data, null] as [T, never];
  } catch (err) {
    console.error(err);
    return [null, err] as [never, unknown];
  }
}

/**
 * Creates a configured instance for interacting with the eSewa payment gateway.
 *
 * @param env - The environment to use (`test` or `production`).
 * @param merchantId - The merchant's unique ID provided by eSewa.
 * @param secretKey  - The merchant's secret key for authentication with eSewa.
 * @returns An object with bound functions for initiating payments and checking payment status:
 *          - `initiateEsewaPayment`
 *          - `checkEsewaPaymentStatus`
 */
export const createEsewaInstance = ({
  env,
  merchantId,
  secretKey,
}: {
  env: "test" | "production";
  merchantId: string;
  secretKey: string;
}) => {
  const urls = {
    test: "https://uat.esewa.com.np",
    production: "https://esewa.com.np",
  };

  const instance = axios.create({
    baseURL: urls[env],
    headers: {
      "Content-Type": "application/json",
      // TODO: Add authorization header as required by eSewa (might be different than Khalti)
    },
    responseType: "json",
  });

  return {
    initiateEsewaPayment: initiateEsewaPayment(instance),
    checkEsewaPaymentStatus: checkEsewaPaymentStatus(instance),
  };
};

/**
 * Handles payment initiation using a configured Axios instance.
 *
 * @param instance - An Axios instance configured for eSewa communication.
 * @returns A function to initiate eSewa payments.
 */

const initiateEsewaPayment = (instance: AxiosInstance) => {
  return async (payload: EsawaPaymentRequest) => {
    const [response, error] = await awTry<{ data: unknown }>(
      instance.post("/epay/initiate/", payload)
    );

    if (error) {
      console.log("Error, in initiateEsewaPayment: ", error);
      // Handle the error appropriately
    }
  };
};

/**
 * Checks the status of an eSewa payment using a configured Axios instance.
 *
 * @param instance - An Axios instance configured for eSewa communication.
 * @returns A function to check the status of eSewa payments.
 */
const checkEsewaPaymentStatus = (instance: AxiosInstance) => {
  return async ({
    product_code,
    transaction_uuid,
    total_amount,
  }: {
    product_code: string;
    transaction_uuid: string;
    total_amount: number;
  }) => {
    const [response, error] = await awTry<{ data: EsawaStatusCheckResponse }>(
      instance.get("/api/epay/transaction/status/", {
        params: { product_code, total_amount, transaction_uuid },
      })
    );
    if (error) {
      console.log("Error, in checkEsewaPaymentStatus: ", error);
      // Handle the error appropriately
    }
    return response.data;
  };
};
