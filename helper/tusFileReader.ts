import * as FileSystem from 'expo-file-system';
import base64 from 'base64-js';

export class TusFileReader {
  constructor() {
    console.log('CALLING SIMONS CONSTRUCTOR');
  }
  openFile(input: Blob, chunkSize: number): Promise<FileSource> {
    console.log('CALLING SIMONS OPENFILE: ', JSON.stringify(input));
    console.log('CALLING SIMONS OPENFILE2: ', chunkSize);

    return new Promise((resolve, reject) => {
      console.log('passing size: ', input.size);

      resolve(new TusFileSource(input, input.size));
      // FileSystem.getInfoAsync(input.uri, { size: true }).then((info) => {
      //   console.log('SIMONSINFO', info);
      //   resolve(new TusFileSource(input, info['size']));
      // });
    });
  }
}

export class TusFileSource implements FileSource {
  size: any;
  file: any;

  constructor(file, size) {
    console.log('SIMONS CONSTRUCTOR#1: ', JSON.stringify(file));
    console.log('SIMONS CONSTRUCTOR#2: ', size);

    this.file = file;
    this.size = size;
  }

  slice(start: number, end: number): Promise<SliceResult> {
    console.log('SIMONS SLICE', start);
    console.log('SIMONS SLICE2', end);
    console.log('SIMONS SLICE source', this.file.source);

    return new Promise((resolve, reject) => {
      const options = {
        encoding: FileSystem.EncodingType.Base64,
        length: Math.min(end, this.size) - start,
        position: start,
      };
      FileSystem.readAsStringAsync(this.file.source, options).then((data) => {
        resolve({ value: base64.toByteArray(data), done: true });
      });
    });
  }

  close() {
    console.log('SIMONS CLOSE');
  }
}

interface FileReader {
  openFile(input: any, chunkSize: number): Promise<FileSource>;
}

// Taken from Uppy definition file
interface FileSource {
  size: number;
  slice(start: number, end: number): Promise<SliceResult>;
  close(): void;
}

interface SliceResult {
  // Platform-specific data type which must be usable by the HTTP stack as a body.
  value: any;
  done: boolean;
}
