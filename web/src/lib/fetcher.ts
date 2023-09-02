// import fetch from "node-fetch";

export const fetcher = async <T>(
  path: string,
  method: HTTPMethod,
  params?: Record<string, string>
): Promise<T> => {
  const baseURL = "http://127.0.0.1:5050";
  const url = `${baseURL}/${path}`;

  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");

  try {
    const response = await fetch(url, {
      headers: headers,
      method: method,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Something went wrong");
  }
};

// there is a problem with nextjs in which it doesn't recognize the local server
export const serverFetch = async <T>(
  path: string,
  method: HTTPMethod,
  params: any
): Promise<T> => {
  const headers = new Headers();
  const base = "http://localhost:5050";
  const url = `${base}/${path}`;
  headers.append("Content-Type", "application/json");
  headers.append("Accept", "application/json");

  try {
    const response = await fetch(url, {
      headers: headers,
      method: method,
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Something went wrong");
  }
};

export enum HTTPMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
