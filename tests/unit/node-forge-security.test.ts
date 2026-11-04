import { describe, expect, test } from "bun:test";
import forge from "node-forge";

describe("node-forge RSA DigestInfo validation", () => {
  const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair({
    bits: 1024,
    e: 0x03,
  });
  const digest = forge.md.sha256
    .create()
    .update("security regression")
    .digest()
    .getBytes();
  const sha256Oid: string =
    forge.pki.oids.sha256 ??
    (() => {
      throw new Error("node-forge does not define the SHA-256 OID");
    })();

  function signatureWithAlgorithmChildren(
    includeNull: boolean,
    extraAt?: number,
  ): string {
    const children = [
      forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.OID,
        false,
        forge.asn1.oidToDer(sha256Oid).getBytes(),
      ),
    ];
    if (includeNull) {
      children.push(
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.NULL,
          false,
          "",
        ),
      );
    }
    if (extraAt !== undefined) {
      children.splice(
        extraAt,
        0,
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.OCTETSTRING,
          false,
          "extra",
        ),
      );
    }

    const digestInfo = forge.asn1.create(
      forge.asn1.Class.UNIVERSAL,
      forge.asn1.Type.SEQUENCE,
      true,
      [
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.SEQUENCE,
          true,
          children,
        ),
        forge.asn1.create(
          forge.asn1.Class.UNIVERSAL,
          forge.asn1.Type.OCTETSTRING,
          false,
          digest,
        ),
      ],
    );
    return privateKey.sign(forge.asn1.toDer(digestInfo).getBytes(), "NONE");
  }

  test.each([false, true])(
    "accepts a valid digest with NULL parameters: %s",
    (includeNull) => {
      expect(
        publicKey.verify(digest, signatureWithAlgorithmChildren(includeNull)),
      ).toBe(true);
    },
  );

  test.each([
    [false, 1],
    [true, 1],
    [true, 2],
  ])(
    "rejects an extra nested element (NULL: %s, index: %i)",
    (includeNull, extraAt) => {
      expect(() =>
        publicKey.verify(
          digest,
          signatureWithAlgorithmChildren(includeNull, extraAt),
        ),
      ).toThrow(/valid RSASSA-PKCS1-v1_5 DigestInfo value/);
    },
  );
});
