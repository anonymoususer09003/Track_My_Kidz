import { Config } from '@/Config'
import { loadUserId } from '@/Storage/MainAppStorage'

import uuid from 'react-native-uuid'
import S3 from 'aws-sdk/clients/s3'

export interface FileUploadAWS {
  uri: string
  name: string
  type: string
}
export async function uploadPost(
  file: FileUploadAWS,
  contentType: string,
  bucketFolder: 'post' | 'class' | 'blog' | 'product' | 'profile',
) {
  const userId = await loadUserId()

  const bucket = new S3({
    accessKeyId: Config.ACCESSKEYID,
    secretAccessKey: Config.SECRETKEYID,
    region: Config.REGION,
  })
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      ;
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", file.uri, true);
    xhr.send(null);
  });
  const response = await fetch(file.uri)

  const params = {
    Bucket: Config.BUCKET,
    Key: userId + '/' + bucketFolder + '/' + uuid.v4() + file.name,
    Body: blob,
    ACL: 'public-read',
    ContentType: contentType,
  }
  return bucket.upload(params)
}
export async function simpleUpload(
  file: FileUploadAWS,
  contentType: string,
  bucketFolder: 'post' | 'class' | 'blog' | 'product' | 'profile',
) {
  const userId = await loadUserId()
  const bucket = new S3({
    accessKeyId: Config.ACCESSKEYID,
    secretAccessKey: Config.SECRETKEYID,
    region: Config.REGION,
  })
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      ;
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", file.uri, true);
    xhr.send(null);
  });
   const response = await fetch(file.uri)



  const params = {
    Bucket: Config.BUCKET,
    Key: userId + '/' + bucketFolder + '/' + uuid.v4() + file.name,
    Body: blob,
    ACL: 'public-read',
    ContentType: contentType,
  }
  const managedUpload = await bucket.upload(params)
  return await managedUpload.promise()
}

export async function photoUpload(
  file: FileUploadAWS,
  contentType: string,
  userId: string
) {
  const bucket = new S3({
    accessKeyId: Config.ACCESSKEYID,
    secretAccessKey: Config.SECRETKEYID,
    region: Config.REGION,
  })

  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr.response);
    };
    xhr.onerror = function (e) {
      ;
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", file.uri, true);
    xhr.send(null);
  });
  const response = await fetch(file.uri)



  const params = {
    Bucket: Config.BUCKET,
    Key: userId + '/profile/' + uuid.v4() + file.name,
    Body: blob,
    ACL: 'public-read',
    ContentType: contentType,
  }
  const managedUpload = await bucket.upload(params)
  return await managedUpload.promise()
}
