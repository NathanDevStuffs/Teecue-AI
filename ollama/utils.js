import { version } from './version.js';

class ResponseError extends Error {
  constructor(error, status_code) {
    super(error);
    this.error = error;
    this.status_code = status_code;
    this.name = 'ResponseError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResponseError);
    }
  }
}

const checkOk = async (response) => {
  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`;
    let errorData = null;

    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        errorData = (await response.json());
        message = errorData.error || message;
      } catch (error) {
        console.log('Failed to parse error response as JSON');
      }
    } else {
      try {
        console.log('Getting text from response');
        const textResponse = await response.text();
        message = textResponse || message;
      } catch (error) {
        console.log('Failed to get text from error response');
      }
    }

    throw new ResponseError(message, response.status);
  }
};

function getPlatform() {
  if (typeof window !== 'undefined' && window.navigator) {
    return `${window.navigator.platform.toLowerCase()} Browser/${navigator.userAgent};`;
  } else if (typeof process !== 'undefined') {
    return `${process.arch} ${process.platform} Node.js/${process.version}`;
  }
  return ''; // unknown
}

const fetchWithHeaders = async (fetch, url, options = {}) => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': `ollama-js/${version} (${getPlatform()})`,
  };

  if (!options.headers) {
    options.headers = {};
  }

  options.headers = {
    ...defaultHeaders,
    ...options.headers,
  };

  return fetch(url, options);
};

export const get = async (fetch, host) => {
  const response = await fetchWithHeaders(fetch, host);

  await checkOk(response);

  return response;
};

export const head = async (fetch, host) => {
  const response = await fetchWithHeaders(fetch, host, {
    method: 'HEAD',
  });

  await checkOk(response);

  return response;
};

export const post = async (fetch, host, data, options) => {
  const isRecord = (input) => {
    return input !== null && typeof input === 'object' && !Array.isArray(input);
  };

  const formattedData = isRecord(data) ? JSON.stringify(data) : data;

  const response = await fetchWithHeaders(fetch, host, {
    method: 'POST',
    body: formattedData,
    signal: options?.signal,
  });

  await checkOk(response);

  return response;
};

export const del = async (fetch, host, data) => {
  const response = await fetchWithHeaders(fetch, host, {
    method: 'DELETE',
    body: JSON.stringify(data),
  });

  await checkOk(response);

  return response;
};

export const parseJSON = async function* (itr) {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const reader = itr.getReader();

  while (true) {
    const { done, value: chunk } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(chunk);

    const parts = buffer.split('\n');

    buffer = parts.pop() || '';

    for (const part of parts) {
      try {
        yield JSON.parse(part);
      } catch (error) {
        console.warn('invalid json: ', part);
      }
    }
  }

  for (const part of buffer.split('\n').filter((p) => p !== '')) {
    try {
      yield JSON.parse(part);
    } catch (error) {
      console.warn('invalid json: ', part);
    }
  }
};

export const formatHost = (host) => {
  if (!host) {
    return 'http://127.0.0.1:11434';
  }

  let isExplicitProtocol = host.includes('://');

  if (host.startsWith(':')) {
    // if host starts with ':', prepend the default hostname
    host = `http://127.0.0.1${host}`;
    isExplicitProtocol = false;
  }

  if (!isExplicitProtocol) {
    host = `http://${host}`;
  }

  const url = new URL(host);

  let port = url.port;
  if (!port) {
    if (!isExplicitProtocol) {
      port = '11434';
    } else {
      // Assign default ports based on the protocol
      port = url.protocol === 'https:' ? '443' : '80';
    }
  }

  let formattedHost = `${url.protocol}//${url.hostname}:${port}${url.pathname}`;
  // remove trailing slashes
  if (formattedHost.endsWith('/')) {
    formattedHost = formattedHost.slice(0, -1);
  }

  return formattedHost;
};
