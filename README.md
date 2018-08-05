# precompress
[![](https://img.shields.io/npm/v/precompress.svg?style=flat)](https://www.npmjs.org/package/precompress) [![](https://img.shields.io/npm/dm/precompress.svg)](https://www.npmjs.org/package/precompress) [![](https://api.travis-ci.org/silverwind/precompress.svg?style=flat)](https://travis-ci.org/silverwind/precompress)

> Generate pre-compressed .gz and .br files for static web servers

Outputs files to be used with web servers like nginx with the `gzip_static` and `brotli_static` directives. Files are compressed in parallel, using the available CPU cores efficiently. Compression is done using the brotli and zopfli algorithms to achieve the smallest possible files. Existing output files will always be overridden.

## Usage
To create or update `.gz` and `.br` for all files in the `build` directory:
```
npm i precompress
npx precompress build
```

© [silverwind](https://github.com/silverwind), distributed under BSD licence
