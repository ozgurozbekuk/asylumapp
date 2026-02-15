const FETCH_TIMEOUT_MS = 60_000;

const getUserAgent = () => {
  const contact = process.env.GOVUK_CONTACT_EMAIL || "noreply@example.com";
  return `asylumapp-ingester/1.0 (${contact})`;
};

export const fetchGovUkContent = async (sourcePath) => {
  const url = new URL(String(sourcePath || ""), "https://www.gov.uk").toString();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": getUserAgent(),
        Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`status=${response.status} body=${body.slice(0, 400)}`);
    }

    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    const bodyText = await response.text();
    const data = contentType.includes("application/json") ? JSON.parse(bodyText) : { details: { body: bodyText } };

    return {
      data,
      url,
      fromCache: false,
      fetchedAt: new Date().toISOString(),
      contentHash: null,
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
