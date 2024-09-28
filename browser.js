import * as utils from './utils.js';
class Ollama {
  constructor(config) {
    this.config = {
      host: ''
    };
    if (!config?.proxy) {
      this.config.host = utils.formatHost(config?.host ?? 'http://127.0.0.1:11434');
    }

    this.fetch = fetch;
    if (config?.fetch != null) {
      this.fetch = config.fetch;
    }

    this.abortController = new AbortController();
  }

  abort() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  async processStreamableRequest(endpoint, request) {
    request.stream = request.stream ?? false;
    const response = await utils.post(
      this.fetch,
      `${this.config.host}/api/${endpoint}`, {
        ...request,
      }, {
        signal: this.abortController.signal
      }
    );

    if (!response.body) {
      throw new Error('Missing body');
    }

    const itr = utils.parseJSON(response.body);

    if (request.stream) {
      return (async function* () {
        for await (const message of itr) {
          if ('error' in message) {
            throw new Error(message.error);
          }
          yield message;
          if ((message).done || (message).status === 'success') {
            return;
          }
        }
        throw new Error('Did not receive done or success response in stream.');
      })();
    } else {
      const message = await itr.next();
      if (!message.value.done && (message.value).status !== 'success') {
        throw new Error('Expected a completed response.');
      }
      return message.value;
    }
  }

  async encodeImage(image) {
    if (typeof image !== 'string') {
      const uint8Array = new Uint8Array(image);
      const numberArray = Array.from(uint8Array);
      const base64String = btoa(String.fromCharCode.apply(null, numberArray));
      return base64String;
    }
    return image;
  }

  async generate(request) {
    if (request.images) {
      request.images = await Promise.all(request.images.map(this.encodeImage.bind(this)));
    }
    return this.processStreamableRequest('generate', request);
  }

  async chat(request) {
    if (request.messages) {
      for (const message of request.messages) {
        if (message.images) {
          message.images = await Promise.all(message.images.map(this.encodeImage.bind(this)));
        }
      }
    }
    return this.processStreamableRequest('chat', request);
  }

  async create(request) {
    return this.processStreamableRequest('create', {
      name: request.model,
      stream: request.stream,
      modelfile: request.modelfile,
    });
  }

  async pull(request) {
    return this.processStreamableRequest('pull', {
      name: request.model,
      stream: request.stream,
      insecure: request.insecure,
    });
  }

  async push(request) {
    return this.processStreamableRequest('push', {
      name: request.model,
      stream: request.stream,
      insecure: request.insecure,
    });
  }

  async delete(request) {
    await utils.del(this.fetch, `${this.config.host}/api/delete`, {
      name: request.model,
    });
    return {
      status: 'success'
    };
  }

  async copy(request) {
    await utils.post(this.fetch, `${this.config.host}/api/copy`, { ...request
    });
    return {
      status: 'success'
    };
  }

  async list() {
    const response = await utils.get(this.fetch, `${this.config.host}/api/tags`);
    const listResponse = await response.json();
    return listResponse;
  }

  async show(request) {
    const response = await utils.post(this.fetch, `${this.config.host}/api/show`, {
      ...request
    });
    const showResponse = await response.json();
    return showResponse;
  }

  async embeddings(request) {
    const response = await utils.post(this.fetch, `${this.config.host}/api/embeddings`, {
      ...request
    });
    const embeddingsResponse = await response.json();
    return embeddingsResponse;
  }
}

export default new Ollama();
export * from './interfaces.js';
