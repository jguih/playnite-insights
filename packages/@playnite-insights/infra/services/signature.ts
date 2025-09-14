import {
  FileSystemService,
  LogService,
  SignatureService,
} from "@playnite-insights/core";
import { sign as cryptoSign, generateKeyPairSync } from "crypto";
import { join } from "path";
import * as config from "../config/config";
import { defaultFileSystemService } from "./file-system";
import { defaultLogger } from "./log";

export type SignatureServiceDeps = {
  fileSystemService: FileSystemService;
  logService: LogService;
  SECURITY_DIR: string;
};

export const makeSignatureService = (
  deps: Partial<SignatureServiceDeps> = {}
): SignatureService => {
  const { fileSystemService, SECURITY_DIR, logService }: SignatureServiceDeps =
    {
      fileSystemService: defaultFileSystemService,
      logService: defaultLogger,
      SECURITY_DIR: config.SECURITY_DIR,
      ...deps,
    };
  const keysDir = join(SECURITY_DIR, "/keys");
  const publicKeyPath = join(keysDir, "public-key.der");
  const privateKeyPath = join(keysDir, "private-key.der");

  const generateKeyPairAsync: SignatureService["generateKeyPairAsync"] =
    async () => {
      logService.info(`Generating asymmetric keys`);

      try {
        await fileSystemService.access(publicKeyPath);
        await fileSystemService.access(privateKeyPath);
        logService.info(
          `Skipping asymmetric key generation, both keys already exist`
        );
        return;
      } catch {
        logService.info(`Asymmetric keys do not exist, generating new pair`);
      }

      await fileSystemService.mkdir(keysDir, { recursive: true });
      const { publicKey, privateKey } = generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: { type: "spki", format: "der" },
        privateKeyEncoding: { type: "pkcs8", format: "der" },
      });
      await fileSystemService.writeFile(publicKeyPath, publicKey, {
        encoding: "utf-8",
      });
      await fileSystemService.writeFile(privateKeyPath, privateKey, {
        encoding: "utf-8",
      });
      logService.success(`Asymmetric keys created successfully`);
    };

  const signAsync: SignatureService["signAsync"] = async (data) => {
    const buffer = Buffer.from(data);
    const privKey = await fileSystemService.readfile(privateKeyPath);
    const signature = cryptoSign("sha256", buffer, {
      key: privKey,
      format: "der",
      type: "pkcs8",
    });
    return signature.toString("base64");
  };

  return { generateKeyPairAsync, signAsync };
};
