import { JSEncrypt } from 'jsencrypt';

// RSA 公钥
const publicKey = `-----BEGIN GIN WEB PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtCtCtXUpF16JnLVjCZJF
/30x8hfdkwn+mLYu/M64vY6SG4nJJm784tmfQetgeEl5JQXrOxVa6xWwdlU7UooJ
TmwJbRCahUTY9XBqMLzFBnHwGrM4yTJ09X0qRWF4ca4Zk2CfSaSUp6YI2QmNDavy
NnP2IsgmVBl4prMkRq8csOM+HcPPjhPTJsqmRYM6o6ZCOEsCI07w5TgjWyffB+xY
M0h9/tVBHJyicOEbEIJN8IMx1lWi+RNlh1WJVdZmgutF8iEiYkwfqOb2GKj2ptMn
BwmuTWtTzbm+Tz4/Xc3XO1nN+N0lG9W3c0iCHNdcq069CWhQlDt/vtFMPmKiT6/S
py8+tYke0b363jHSQG90hLK1ZT+mmcp1CdrsOIX4C1l2AMpRQmtPES11uU6a6W3d
JxMCj8+K8E3Swt2yaJf0DH9Ej6Kz942sMXuaXOQPot1fT1Y76STmkUa/QPnxTtsU
sMQAxZnIXodbaeLi40pRmHgtWrAAvEF1BqT3VJRNnarNGITtCvvSNUG8qt7+yCy7
zCk/h1/g4+dIvRlQsYYrnOkGvNr3SqnA8AlJtDai2tdxQo2mUxoxB6btQL8y/3Pg
qhkX/2CdjTtLPLSmgZQmBfQLoOELbWdmX58IdLhjI/eIUUlrBP4vQqAaLwJMCC5a
IeddThz+w43h2ZZdgtLR/B8CAwEAAQ==
-----END GIN WEB PUBLIC KEY-----`;

/**
 * 使用 RSA 公钥加密密码
 * @param password 原始密码
 * @returns 加密后的密码
 */
export const encryptPassword = (password: string): string => {
  const encryptor = new JSEncrypt({});
  // 设置公钥
  encryptor.setPublicKey(publicKey);
  // 加密密码
  const encrypted = encryptor.encrypt(password);
  return typeof encrypted === 'string' ? encrypted : password;
};