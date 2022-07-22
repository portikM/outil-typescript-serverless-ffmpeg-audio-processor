import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { MediaTypesEnum } from '../../common/enums/media-types.enum';
import { promises as fs } from 'fs';

@Injectable()
export class StorageService {
  private getS3() {
    return new S3();
  }

  getSignedURL(mediaType: string, key: string): string {
    const s3 = this.getS3();
    const extension = mediaType === MediaTypesEnum.AUDIO ? '.mp3' : '.mp4';
    return s3.getSignedUrl('putObject', {
      Bucket: process.env.INPUT_BUCKET,
      Key: `${mediaType}/${key + extension}`,
    });
  }

  getObject(mediaType: string, key: string, bucket?: string) {
    const s3 = this.getS3();
    const extension = mediaType === MediaTypesEnum.AUDIO ? '.mp3' : '.mp4';
    return new Promise((resolve, reject) => {
      s3.getObject(
        {
          Bucket: bucket || (process.env.INPUT_BUCKET as string),
          Key: `${mediaType}/${key + extension}`,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.Body);
          }
        },
      );
    });
  }

  async putObject(mediaType: string, key: string, path: string) {
    const s3 = this.getS3();
    const extension = mediaType === MediaTypesEnum.AUDIO ? '.mp3' : '.mp4';
    const contentType =
      mediaType === MediaTypesEnum.AUDIO ? 'audio/mpeg' : 'video/mp4';

    let body: Buffer;
    try {
      body = await fs.readFile(path);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error saving output file');
    }

    return new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: process.env.OUTPUT_BUCKET as string,
          Key: `${mediaType}/${key + extension}`,
          Body: body,
          ContentType: contentType,
          ACL: 'public-read',
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        },
      );
    });
  }
}
