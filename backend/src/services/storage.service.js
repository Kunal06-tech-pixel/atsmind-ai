import fs from "fs/promises";
import path from "path";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const uploadDir = path.resolve("uploads");

const getS3Client = () => {
  if (!process.env.RESUME_UPLOADS_BUCKET) {
    return null;
  }

  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
  });
};

const streamToBuffer = async (stream) => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

export const saveResumeFile = async ({ userId, originalName, buffer }) => {
  const s3 = getS3Client();
  const safeName = path.basename(originalName).replace(/[^\w. -]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;

  if (s3) {
    const key = `resumes/${userId}/${fileName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.RESUME_UPLOADS_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
        ServerSideEncryption: process.env.S3_SERVER_SIDE_ENCRYPTION || "AES256",
      })
    );

    return {
      storageProvider: "s3",
      s3Key: key,
      filePath: "",
    };
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    storageProvider: "local",
    s3Key: "",
    filePath,
  };
};

export const readResumeFile = async ({ storageProvider, s3Key, filePath }) => {
  if (storageProvider === "s3") {
    const s3 = getS3Client();

    if (!s3) {
      throw new Error("S3 storage is configured on the analysis but no bucket is set");
    }

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.RESUME_UPLOADS_BUCKET,
        Key: s3Key,
      })
    );

    return streamToBuffer(response.Body);
  }

  return fs.readFile(filePath);
};

export const deleteResumeFile = async ({ storageProvider, s3Key, filePath }) => {
  if (storageProvider === "s3") {
    const s3 = getS3Client();

    if (!s3 || !s3Key) {
      return false;
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.RESUME_UPLOADS_BUCKET,
        Key: s3Key,
      })
    );
    return true;
  }

  if (filePath) {
    await fs.unlink(filePath).catch(() => {});
    return true;
  }

  return false;
};

