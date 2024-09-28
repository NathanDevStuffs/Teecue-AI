// request types
export const Fetch = fetch;
export const Config = {
  host: "",
  fetch: Fetch,
  proxy: false,
};

export const Options = {
  numa: false,
  num_ctx: 0,
  num_batch: 0,
  main_gpu: 0,
  low_vram: false,
  f16_kv: false,
  logits_all: false,
  vocab_only: false,
  use_mmap: false,
  use_mlock: false,
  embedding_only: false,
  num_thread: 0,
  num_keep: 0,
  seed: 0,
  num_predict: 0,
  top_k: 0,
  top_p: 0,
  tfs_z: 0,
  typical_p: 0,
  repeat_last_n: 0,
  temperature: 0,
  repeat_penalty: 0,
  presence_penalty: 0,
  frequency_penalty: 0,
  mirostat: 0,
  mirostat_tau: 0,
  mirostat_eta: 0,
  penalize_newline: false,
  stop: [],
};

export const GenerateRequest = {
  model: "",
  prompt: "",
  system: undefined,
  template: undefined,
  context: [],
  stream: false,
  raw: false,
  format: "",
  images: [],
  keep_alive: undefined,
  options: Options,
};

export const Message = {
  role: "",
  content: "",
  images: [],
};

export const ChatRequest = {
  model: "",
  messages: [Message],
  stream: false,
  format: "",
  keep_alive: undefined,
  options: Options,
};

export const PullRequest = {
  model: "",
  insecure: false,
  stream: false,
};

export const PushRequest = {
  model: "",
  insecure: false,
  stream: false,
};

export const CreateRequest = {
  model: "",
  path: undefined,
  modelfile: undefined,
  stream: false,
};

export const DeleteRequest = {
  model: "",
};

export const CopyRequest = {
  source: "",
  destination: "",
};

export const ShowRequest = {
  model: "",
  system: undefined,
  template: undefined,
  options: Options,
};

export const EmbeddingsRequest = {
  model: "",
  prompt: "",
  keep_alive: undefined,
  options: Options,
};

// response types

export const GenerateResponse = {
  model: "",
  created_at: new Date(),
  response: "",
  done: false,
  context: [],
  total_duration: 0,
  load_duration: 0,
  prompt_eval_count: 0,
  prompt_eval_duration: 0,
  eval_count: 0,
  eval_duration: 0,
};

export const ChatResponse = {
  model: "",
  created_at: new Date(),
  message: Message,
  done: false,
  total_duration: 0,
  load_duration: 0,
  prompt_eval_count: 0,
  prompt_eval_duration: 0,
  eval_count: 0,
  eval_duration: 0,
};

export const EmbeddingsResponse = {
  embedding: [],
};

export const ProgressResponse = {
  status: "",
  digest: "",
  total: 0,
  completed: 0,
};

export const ModelDetails = {
  parent_model: "",
  format: "",
  family: "",
  families: [],
  parameter_size: "",
  quantization_level: "",
};

export const ModelResponse = {
  name: "",
  modified_at: new Date(),
  size: 0,
  digest: "",
  details: ModelDetails,
};



export const ShowResponse = {
  license: "",
  modelfile: "",
  parameters: "",
  template: "",
  system: "",
  parent_model: "",
  format: "",
  family: "",
  families: [],
  parameter_size: "",
  quantization_level: "",
  messages: [Message],
};

export const ListResponse = {
  models: [ModelResponse],
};

export const ErrorResponse = {
  error: "",
};

export const StatusResponse = {
  status: "",
};
