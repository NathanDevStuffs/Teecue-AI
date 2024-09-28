const utils = require('./utils.js');
const fs = require('fs').promises;
const { createReadStream } = require('fs');
const { join, resolve, dirname } = require('path');
const { createHash } = require('crypto');
const { homedir } = require('os');
const { Ollama: OllamaBrowser } = require('./browser.js');

class Ollama extends OllamaBrowser {
  async encodeImage(image) {
    if (typeof image !== 'string') {
      // image is Uint8Array or Buffer, convert it to base64
      const result = Buffer.from(image).toString('base64');
      return result;
    }
    try {
      if (fs.existsSync(image)) {
        // this is a filepath, read the file and convert it to base64
        const fileBuffer = await fs.readFile(resolve(image));
        return Buffer.from(fileBuffer).toString('base64');
      }
    } catch {
      // continue
    }
    // the string may be base64 encoded
    return image;
  }

  async parseModelfile(modelfile, mfDir = process.cwd()) {
    const out = [];
    const lines = modelfile.split('\n');
    for (const line of lines) {
      const [command, args] = line.split(' ', 2);
      if (['FROM', 'ADAPTER'].includes(command.toUpperCase())) {
        const path = this.resolvePath(args.trim(), mfDir);
        if (await this.fileExists(path)) {
          out.push(`${command} @${await this.createBlob(path)}`);
        } else {
          out.push(`${command} ${args}`);
        }
      } else {
        out.push(line);
      }
    }
    return out.join('\n');
  }

  resolvePath(inputPath, mfDir) {
    if (inputPath.startsWith('~')) {
      return join(homedir(), inputPath.slice(1));
    }
    return resolve(mfDir, inputPath);
  }

  async fileExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async createBlob(path) {
    if (typeof ReadableStream === 'undefined') {
      // Not all fetch implementations support streaming
      // TODO: support non-streaming uploads
      throw new Error('Streaming uploads are not supported in this environment.');
    }

    const fileStream = createReadStream(path);

    const sha256sum = await new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      fileStream.on('data', (data) => hash.update(data));
      fileStream.on('end', () => resolve(hash.digest('hex')));
      fileStream.on('error', reject);
    });

    const digest = `sha256:${sha256sum}`;

    try {
      await utils.head(this.fetch, `${this.config.host}/api/blobs/${digest}`);
    } catch (e) {
      if (e instanceof Error && e.message.includes('404')) {
        const readableStream = new ReadableStream({
          start(controller) {
            fileStream.on('data', (chunk) => {
              controller.enqueue(chunk);
            });

            fileStream.on('end', () => {
              controller.close();
            });

            fileStream.on('error', (err) => {
              controller.error(err);
            });
          },
        });

        await utils.post(
          this.fetch,
          `${this.config.host}/api/blobs/${digest}`,
          readableStream
        );
      } else {
        throw e;
      }
    }

    return digest;
  }

  async create(request) {
    let modelfileContent = '';
    if (request.path) {
      modelfileContent = await fs.readFile(request.path, { encoding: 'utf8' });
      modelfileContent = await this.parseModelfile(
        modelfileContent,
        dirname(request.path)
      );
    } else if (request.modelfile) {
      modelfileContent = await this.parseModelfile(request.modelfile);
    } else {
      throw new Error('Must provide either path or modelfile to create a model');
    }
    request.modelfile = modelfileContent;

    if (request.stream) {
      return super.create(request);
    } else {
      return super.create(request);
    }
  }
}

module.exports = new Ollama();

// export all types from the main entry point so that packages importing types dont need to specify paths
module.exports = require('./interfaces.js');
