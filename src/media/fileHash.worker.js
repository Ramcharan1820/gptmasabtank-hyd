import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

self.onmessage = async (event) => {
  const { id, file } = event.data || {};

  try {
    const hash = sha256.create();
    const reader = file.stream().getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      hash.update(value);
    }

    self.postMessage({ id, digest: bytesToHex(hash.digest()) });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : "Unable to hash this file.",
    });
  }
};
