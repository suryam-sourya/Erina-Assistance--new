export async function getZohoAccessToken() {
  if (!process.env.ZOHO_REFRESH_TOKEN) {
    throw new Error(
      "ZOHO_REFRESH_TOKEN missing"
    );
  }

  // token API call later
}

export async function createZohoInvoice(
  invoiceData: any
) {
  const token =
    await getZohoAccessToken();

  // create invoice later
}

export async function getZohoInvoicePdf(
  invoiceId: string
) {
  const token =
    await getZohoAccessToken();

  // pdf download later
}